param (
    [string]$Action = "status",
    [string]$RuleName = "",
    [string]$Enabled = "",
    [string]$Direction = "in",
    [string]$RuleAction = "allow",
    [string]$Protocol = "TCP",
    [string]$Port = "",
    [string]$Program = "",
    [string]$ProfileName = ""
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

function Get-AdminStatus {
    $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Get-FirewallProfiles {
    $fw = New-Object -ComObject HNetCfg.FwPolicy2
    $profiles = @(
        @{
            name = "Domain"
            profileType = 1
            enabled = [bool]$fw.FirewallEnabled(1)
            inboundAction = if ($fw.DefaultInboundAction(1) -eq 0) { "Block" } else { "Allow" }
            outboundAction = if ($fw.DefaultOutboundAction(1) -eq 0) { "Block" } else { "Allow" }
        },
        @{
            name = "Private"
            profileType = 2
            enabled = [bool]$fw.FirewallEnabled(2)
            inboundAction = if ($fw.DefaultInboundAction(2) -eq 0) { "Block" } else { "Allow" }
            outboundAction = if ($fw.DefaultOutboundAction(2) -eq 0) { "Block" } else { "Allow" }
        },
        @{
            name = "Public"
            profileType = 4
            enabled = [bool]$fw.FirewallEnabled(4)
            inboundAction = if ($fw.DefaultInboundAction(4) -eq 0) { "Block" } else { "Allow" }
            outboundAction = if ($fw.DefaultOutboundAction(4) -eq 0) { "Block" } else { "Allow" }
        }
    )
    return $profiles
}

function Get-FirewallRules {
    $fw = New-Object -ComObject HNetCfg.FwPolicy2
    $list = [System.Collections.Generic.List[object]]::new()
    
    foreach ($r in $fw.Rules) {
        $protoStr = switch ($r.Protocol) {
            6 { "TCP" }
            17 { "UDP" }
            1 { "ICMPv4" }
            58 { "ICMPv6" }
            256 { "ANY" }
            default { "$($r.Protocol)" }
        }

        $list.Add([PSCustomObject]@{
            id = $r.Name
            name = $r.Name
            description = if ($r.Description) { $r.Description } else { "" }
            direction = if ($r.Direction -eq 1) { "INBOUND" } else { "OUTBOUND" }
            action = if ($r.Action -eq 1) { "ALLOW" } else { "BLOCK" }
            status = if ($r.Enabled) { "ENABLED" } else { "DISABLED" }
            protocol = $protoStr
            localPorts = if ($r.LocalPorts) { $r.LocalPorts } else { "ANY" }
            remotePorts = if ($r.RemotePorts) { $r.RemotePorts } else { "ANY" }
            localAddresses = if ($r.LocalAddresses) { $r.LocalAddresses } else { "ANY" }
            remoteAddresses = if ($r.RemoteAddresses) { $r.RemoteAddresses } else { "ANY" }
            application = if ($r.ApplicationName) { $r.ApplicationName } else { "" }
            serviceName = if ($r.ServiceName) { $r.ServiceName } else { "" }
            profiles = $r.Profiles
        })
    }
    return $list
}

function Get-ListeningPorts {
    $connections = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue
    $list = [System.Collections.Generic.List[object]]::new()
    $seen = @{}

    foreach ($conn in $connections) {
        $key = "$($conn.LocalPort)"
        if (-not $seen.ContainsKey($key)) {
            $seen[$key] = $true
            $procName = ""
            $procPath = ""
            try {
                $p = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                if ($p) {
                    $procName = $p.ProcessName
                    $procPath = $p.Path
                }
            } catch {}

            $list.Add([PSCustomObject]@{
                port = $conn.LocalPort
                address = $conn.LocalAddress
                pid = $conn.OwningProcess
                processName = $procName
                processPath = $procPath
                protocol = "TCP"
            })
        }
    }
    return $list
}

switch ($Action) {
    "status" {
        $isAdmin = Get-AdminStatus
        $profiles = Get-FirewallProfiles
        $fw = New-Object -ComObject HNetCfg.FwPolicy2
        $ruleCount = $fw.Rules.Count

        $result = @{
            success = $true
            isAdmin = $isAdmin
            totalRules = $ruleCount
            profiles = $profiles
            os = "Windows"
        }
        $result | ConvertTo-Json -Depth 5 -Compress
    }

    "rules" {
        $rules = Get-FirewallRules
        $rules | ConvertTo-Json -Depth 5 -Compress
    }

    "profiles" {
        $profiles = Get-FirewallProfiles
        $profiles | ConvertTo-Json -Depth 5 -Compress
    }

    "listening" {
        $ports = Get-ListeningPorts
        $ports | ConvertTo-Json -Depth 5 -Compress
    }

    "toggle-rule" {
        if (-not (Get-AdminStatus)) {
            @{ success = $false; error = "Administrator privilege required to modify Windows Firewall rules. Please run the server as Administrator." } | ConvertTo-Json -Compress
            exit 1
        }
        $enableVal = if ($Enabled -eq "true" -or $Enabled -eq "ENABLED") { "yes" } else { "no" }
        $cmd = "netsh advfirewall firewall set rule name=`"$RuleName`" new enable=$enableVal"
        $out = Invoke-Expression $cmd
        @{ success = $true; message = "Rule '$RuleName' updated to $enableVal"; output = $out } | ConvertTo-Json -Compress
    }

    "toggle-profile" {
        if (-not (Get-AdminStatus)) {
            @{ success = $false; error = "Administrator privilege required to modify Windows Firewall profiles. Please run the server as Administrator." } | ConvertTo-Json -Compress
            exit 1
        }
        $stateVal = if ($Enabled -eq "true" -or $Enabled -eq "ENABLED") { "on" } else { "off" }
        $profArg = switch ($ProfileName.ToLower()) {
            "domain" { "domainprofile" }
            "private" { "privateprofile" }
            "public" { "publicprofile" }
            default { "allprofiles" }
        }
        $cmd = "netsh advfirewall set $profArg state $stateVal"
        $out = Invoke-Expression $cmd
        @{ success = $true; message = "Profile '$ProfileName' state set to $stateVal"; output = $out } | ConvertTo-Json -Compress
    }

    "create-rule" {
        if (-not (Get-AdminStatus)) {
            @{ success = $false; error = "Administrator privilege required to add Windows Firewall rules. Please run the server as Administrator." } | ConvertTo-Json -Compress
            exit 1
        }
        
        $dirVal = if ($Direction.ToLower() -eq "out" -or $Direction.ToLower() -eq "outbound") { "out" } else { "in" }
        $actVal = if ($RuleAction.ToLower() -eq "block" -or $RuleAction.ToLower() -eq "deny") { "block" } else { "allow" }
        
        $cmdParts = @("netsh", "advfirewall", "firewall", "add", "rule", "name=`"$RuleName`"", "dir=$dirVal", "action=$actVal")
        
        if ($Program -and $Program.Trim() -ne "") {
            $cmdParts += "program=`"$Program`""
        }
        if ($Protocol -and $Protocol -ne "ANY") {
            $cmdParts += "protocol=$Protocol"
        }
        if ($Port -and $Port.Trim() -ne "" -and $Port -ne "ANY") {
            $cmdParts += "localport=$Port"
        }
        if ($ProfileName -and $ProfileName -ne "ALL") {
            $cmdParts += "profile=$($ProfileName.ToLower())"
        }
        
        $cmd = $cmdParts -join " "
        $out = Invoke-Expression $cmd
        @{ success = $true; message = "Rule '$RuleName' created successfully"; output = $out } | ConvertTo-Json -Compress
    }

    "delete-rule" {
        if (-not (Get-AdminStatus)) {
            @{ success = $false; error = "Administrator privilege required to delete Windows Firewall rules. Please run the server as Administrator." } | ConvertTo-Json -Compress
            exit 1
        }
        $cmd = "netsh advfirewall firewall delete rule name=`"$RuleName`""
        $out = Invoke-Expression $cmd
        @{ success = $true; message = "Rule '$RuleName' deleted"; output = $out } | ConvertTo-Json -Compress
    }

    default {
        @{ error = "Unknown action: $Action" } | ConvertTo-Json -Compress
    }
}
