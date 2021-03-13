strComputer ="."

set objWMIService = GetObject("winmgmts:" _
	& "{impersonationLevel=impersonate}!\\" & strComputer & "\root\cimv2")

set colProcesses=objWMIService.ExecQuery _
	("Select * from Win32_Process Where Name = 'GrespProFinances.exe'")

For Each Processo In colProcesses
	msgbox"Programa ja aberto ou em andamento de abertura!",vbInformation,"Gresp Pro Finances - Aviso"
	WScript.Quit
Next

Set WshShell = WScript.CreateObject( "WScript.shell" )
WshShell.Run "C:\\grespprofinances-x64\\frontend\\GrespProFinances.exe",0,0
WScript.Quit