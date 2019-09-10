@echo off
TITLE First Time Setup
color 30
del passwd

:CHOOSE_LAN
CLS
echo. ----------------------------------------
echo. 
echo. 
echo. e. English
echo. 
echo. c. Simplified Chinese 简体中文
echo. 
echo. x. EXIT
echo. 
echo. 
echo. ----------------------------------------
set choice=
set /p choice= Select Language and Press Enter:
IF NOT "%Choice%"=="" SET Choice=%Choice:~0,1%
if /i "%choice%"=="e" goto ENGLISH
if /i "%choice%"=="c" goto SCHINESE
if /i "%choice%"=="x" goto EXIT
echo.
goto CHOOSE_LAN

:ENGLISH
set select297before344= If you want to setup ECE344 but never started any VNC servers on the UG machine(during ECE297), please select ECE297 first. 

set opt_prompt1= 1. ECE297
set opt_prompt2= 2. ECE344(I have setup VNC for ECE297 before)
set opt_prompt3= 3. Exit

set choice_prompt= You can choose a course then proceed only if you understand the risk

set profile_prompt1= Enter your Utorid
set profile_prompt2= Enter your UG password. It's your student number by default.

set profile_disclaimer1= DISCLAIMER!! Your password will be saved locally on this computer!
set profile_disclaimer2= Do not use this script on a public computer!!

set profile_prompt3= Set up a password for remote connection(at least 6 characters)

set ece344machine_prompt= Please select a machine from 130-180 or 201-249
set ece344port_prompt= Please select a port for your use(a port from 10-100 is recommended). If the port selected is in use, close all the windows and start again with another port or machine

set profile_prompt4= Press any key to connect to the UG server, but plz read the following lines first
set profile_underline= -----------------------------------------------------------
set profile_prompt5= You don't need to enter anything in the upcoming window.
set profile_prompt6= After seeing the prompt “Would you like to enter a view-only password (y/n)? n”
set ece344_profile_prompt6= After seeing the prompt “...to connect to the VNC server.”

set profile_prompt7= Close the upcoming BLACK Terminal
set profile_prompt8= Now you can press any key to continue
set profile_prompt9= Copying encryted password file from the server. It usually take 5s-30s depending on your network speed. If prompted, type "y" and hit "Enter".

set fileName1= Tunnel
set fileName2= Remote

set finish_prompt1= Initialization finished! For further connections, you just need to
set finish_prompt2= Double click on "Remote.bat" to connect
set finish_prompt3= Press any key to show main menu


set enterMachineCode1= When the connection is established, the number after "ugXXX.eecg.toronto.edu :"
set enterMachineCode2= suggests how many people are using this remote machine. If you see any number other than 1,
set enterMachineCode3=  close all scripts and choose a different port or machine.
set enterMachineCode4= Please choose a machine from 132-180 or 201-249:

set enterMachinePort= Please choose a port from 2-8 only if the default port (1) is in use: 

goto MENU

:SCHINESE
TITLE 首次设置

set select297before344= 如果你想设置ECE344，但从未在ECE297中进行过VNC连接（表示很服气），请先选1，设置好ECE297再来
set opt_prompt1= 1. ECE297
set opt_prompt2= 2. ECE344(我曾设置过297的VNC)
set opt_prompt3= 3. 退出

set choice_prompt= 请选择课程并在在明晰风险后继续

set profile_prompt1=输入远程账户登录名(Utorid)
set profile_prompt2= 输入ug账户密码，默认为学号

set profile_disclaimer1= 声明!! 你的登陆密码将储存在电脑本地
set profile_disclaimer2= 请不要在公共电脑上使用该脚本!!

set profile_prompt3= 设个远程连接的登录密码，最少6位数

set ece344machine_prompt= 请选择一个远程机器并回车(130-180, 201-249)
set ece344port_prompt= 请选择你要用的端口(建议从10-100之间选)。如果端口已被占用，关闭所有窗口，换个端口重新再来


set profile_prompt4= 按任意键开始连接到UG服务器，并自动完成设置（请先阅读以下操作）
set profile_underline= -----------------------------------------------------------
set profile_prompt5= 在即将弹出的窗口中不需进行任何输入
set profile_prompt6= 在出现“Would you like to enter a view-only password (y/n)? n”后
set ece344_profile_prompt6= 在出现“...to connect to the VNC server.”后
set profile_prompt7= 将该黑色弹窗关闭}
set profile_prompt8= 现在，按任意键继续
set profile_prompt9= 正在从远程机器生成密码文件到本地，取决于网络速度将需要5s-30s。如果有问是否储存key，输入"y"并回车。

set fileName1= 隧道
set fileName2= 远程连接

set finish_prompt1= 初始化完成! 以后连接时只需
set finish_prompt2= 双击"远程连接.bat" 即可
set finish_prompt3= 按任意键返回主菜单

set enterMachineCode1= 连接完成后，终端窗口中"ugXXX.eecg.toronto.edu :"后的数字
set enterMachineCode2= 意味着有多少人正在使用该远程服务器。如果多于一人使用该服务器，
set enterMachineCode3=  请关闭所有脚本并重新选择其他 端口 或 服务器
set enterMachineCode4= 请在 132-180 或 201-249 选个服务器并按回车确定：

set enterMachinePort= 如果端口"1"被占用，请从2-8选择一个端口：

goto MENU

:MENU
CLS
echo. ----------------------------------------
echo. 
echo. %select297before344%
echo. 
echo. %opt_prompt1%
echo. %opt_prompt2%
echo. %opt_prompt3%
echo. 
echo. ----------------------------------------
echo. %profile_disclaimer1%
echo. %profile_disclaimer2%
echo. ----------------------------------------
echo. 
set choice=
set /p choice= %choice_prompt%: 
IF NOT "%Choice%"=="" SET Choice=%Choice:~0,1%
if /i "%choice%"=="1" goto ECE297
if /i "%choice%"=="2" goto ECE344
if /i "%choice%"=="3" goto EXIT
echo.
goto MENU

:ECE297
CLS
echo. %profile_prompt1%
set /P userName=: 

echo. %profile_prompt2%

set /P realPassword=: 

echo. %profile_prompt3%
set /P fakePassword=: 
CLS
echo. 
echo. %profile_prompt4%
echo. 
echo. %profile_underline% 
echo. %profile_prompt5%
echo. %profile_prompt6%
echo. %profile_prompt7%
echo. %profile_underline% 
echo. 
echo. %profile_prompt8%
PAUSE >nul
kitty_portable.exe -ssh -L 5901:127.0.0.1:5901 %userName%@ug251.eecg.toronto.edu -pw %realPassword% -cmd "ece297vnc password\n\p\p\p\p%fakePassword%\n\p\p\p\p%fakePassword%\n\p\p\p\pn\n"
CLS
echo. %profile_prompt9%
pscp.exe -pw %realPassword% %userName%@ug251.eecg.toronto.edu:./.vnc/passwd passwd

@echo @echo off > %fileName2%.bat
@echo echo. %enterMachineCode1% >> %fileName2%.bat
@echo echo. %enterMachineCode2% >> %fileName2%.bat
@echo echo. %enterMachineCode3% >> %fileName2%.bat
@echo echo. %enterMachineCode4% >> %fileName2%.bat
@echo set /P machineCode=: >> %fileName2%.bat
@echo echo. %enterMachinePort% >> %fileName2%.bat
@echo set /P port=: >> %fileName2%.bat
@echo set /a "portForward=%%port%%+5900">> %fileName2%.bat

@echo @echo kitty_portable.exe -ssh -L %%portForward%%:127.0.0.1:%%portForward%% %userName%@ug%%machineCode%%.eecg.toronto.edu -pw %realPassword% -cmd "ece297vnc stop all \n \p \p  ece297vnc start"  ^> %fileName1%.bat >> %fileName2%.bat

@echo start %fileName1%.bat>> %fileName2%.bat
@echo TIMEOUT 8 >> %fileName2%.bat
@echo vncviewer64-1.9.0.exe -passwd passwd 127.0.0.1:%%port%%>> %fileName2%.bat

CLS
echo. %finish_prompt1%
echo. %finish_prompt2%
echo. %finish_prompt3%
PAUSE >nul
goto EXIT

:ECE344
CLS
echo. %profile_prompt1%
set /P userName=: 

echo. %profile_prompt2%

set /P realPassword=: 

echo. %ece344machine_prompt%
set /P ece344machine=: 

echo. %ece344port_prompt%
set /P ece344port=: 

CLS
echo. 
echo. %profile_prompt4%
echo. 
echo. %profile_underline% 
echo. %profile_prompt5%
echo. %ece344_profile_prompt6%
echo. %profile_prompt7%
echo. %profile_underline% 
echo. 
echo. %profile_prompt8%
PAUSE >nul
set /a ece344forwardPort = %ece344port% + 5900
kitty_portable.exe -ssh %userName%@ug%ece344machine%.eecg.toronto.edu -pw %realPassword% -cmd "vncserver -geometry 1920x1080 -depth 24 :%ece344port% \n\p\p\p"
CLS
echo. %profile_prompt9%
pscp.exe -pw %realPassword% %userName%@ug%ece344machine%.eecg.toronto.edu:./.vnc/passwd passwd

@echo @echo off > %fileName2%.bat

@echo @echo kitty_portable.exe -ssh -L %ece344forwardPort%:127.0.0.1:%ece344forwardPort% %userName%@ug%ece344machine%.eecg.toronto.edu -pw %realPassword%  ^> %fileName1%.bat >> %fileName2%.bat

@echo start %fileName1%.bat>> %fileName2%.bat
@echo TIMEOUT 3 >> %fileName2%.bat
@echo vncviewer64-1.9.0.exe -passwd passwd 127.0.0.1:%ece344port%>> %fileName2%.bat

CLS
echo. %finish_prompt1%
echo. %finish_prompt2%
echo. %finish_prompt3%
PAUSE >nul
goto EXIT

:EXIT
exit