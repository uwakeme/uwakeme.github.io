---
title: 【Windows】Windows命令大全：系统管理与故障排查完整指南
date: 2025-07-18
categories: Windows
tags:
  - Windows
  - 命令行
  - CMD
  - PowerShell
  - 系统管理
  - 故障排查
---

# Windows命令大全：系统管理与故障排查完整指南

## 前言

Windows命令行是系统管理员和高级用户的重要工具，通过命令行可以高效地完成系统配置、故障排查、网络诊断等任务。本文将全面介绍Windows系统中的常用命令，包括传统的CMD命令和现代的PowerShell命令，帮助读者掌握Windows系统管理的核心技能。

## 一、命令行环境介绍

### 1.1 命令行工具对比

#### CMD（命令提示符）
- **特点**：传统的Windows命令行界面
- **优势**：兼容性好，启动快速
- **适用场景**：基本系统操作、批处理脚本
- **启动方式**：Win+R → cmd → 回车

#### PowerShell
- **特点**：现代化的命令行和脚本环境
- **优势**：功能强大，面向对象，支持.NET
- **适用场景**：高级系统管理、自动化脚本
- **启动方式**：Win+X → Windows PowerShell

#### Windows Terminal
- **特点**：现代化的终端应用程序
- **优势**：多标签页，支持多种Shell
- **适用场景**：开发和系统管理
- **获取方式**：Microsoft Store下载

### 1.2 权限管理

#### 以管理员身份运行
```cmd
# 方法1：右键点击命令提示符 → "以管理员身份运行"
# 方法2：Win+X → Windows PowerShell(管理员)
# 方法3：Win+R → cmd → Ctrl+Shift+Enter
```

#### 检查当前权限
```cmd
whoami /groups | find "S-1-16-12288"    # 检查是否为管理员权限
net session                              # 另一种检查管理员权限的方法
```

## 二、文件与目录操作

### 2.1 基础文件操作

#### 目录导航
```cmd
cd C:\Windows                           # 切换到指定目录
cd ..                                   # 返回上级目录
cd \                                    # 返回根目录
cd /d D:\Projects                       # 切换到其他驱动器的目录
pushd C:\Temp                          # 保存当前目录并切换
popd                                   # 返回之前保存的目录
```

#### 查看目录内容
```cmd
dir                                    # 列出当前目录内容
dir /a                                 # 显示所有文件（包括隐藏文件）
dir /s                                 # 递归显示子目录内容
dir /o:d                               # 按日期排序显示
dir /o:s                               # 按大小排序显示
dir *.txt                              # 显示指定扩展名的文件
tree                                   # 以树形结构显示目录
tree /f                                # 显示目录树包含文件名
```

#### 文件操作
```cmd
copy source.txt destination.txt        # 复制文件
copy *.txt D:\Backup\                  # 复制所有txt文件到指定目录
xcopy /s /e source dest                # 复制目录及子目录
robocopy source dest /mir              # 镜像复制（推荐）
move oldname.txt newname.txt           # 移动/重命名文件
del filename.txt                       # 删除文件
del /s *.tmp                          # 递归删除临时文件
ren oldname.txt newname.txt           # 重命名文件
```

#### 目录操作
```cmd
mkdir newfolder                        # 创建目录
mkdir "folder with spaces"             # 创建包含空格的目录名
rmdir emptyfolder                      # 删除空目录
rmdir /s /q folder                     # 强制删除目录及其内容
md C:\Temp\SubFolder                   # 创建多级目录
```

### 2.2 高级文件操作

#### 文件属性管理
```cmd
attrib +h filename.txt                 # 设置隐藏属性
attrib -h filename.txt                 # 取消隐藏属性
attrib +r filename.txt                 # 设置只读属性
attrib -r filename.txt                 # 取消只读属性
attrib +s filename.txt                 # 设置系统属性
```

#### 文件搜索
```cmd
where filename.exe                     # 在PATH中搜索可执行文件
dir /s filename.txt                    # 在当前目录及子目录中搜索文件
forfiles /m *.log /c "cmd /c del @path" # 查找并删除日志文件
```

#### 文件内容操作
```cmd
type filename.txt                      # 显示文件内容
more filename.txt                      # 分页显示文件内容
find "search text" filename.txt       # 在文件中搜索文本
findstr /i "pattern" *.txt            # 使用正则表达式搜索
fc file1.txt file2.txt                # 比较两个文件
```

## 三、系统信息与监控

### 3.1 系统信息查看

#### 基本系统信息
```cmd
systeminfo                            # 显示详细系统信息
systeminfo | find "System Type"       # 查看系统架构
ver                                    # 显示Windows版本
hostname                               # 显示计算机名
whoami                                 # 显示当前用户名
whoami /all                           # 显示用户的所有信息
date                                   # 显示/设置系统日期
time                                   # 显示/设置系统时间
```

#### 硬件信息
```cmd
wmic cpu get name                      # 查看CPU信息
wmic memorychip get capacity           # 查看内存容量
wmic diskdrive get size,model          # 查看硬盘信息
wmic baseboard get product,manufacturer # 查看主板信息
wmic bios get serialnumber             # 查看BIOS序列号
msinfo32                               # 打开系统信息工具
dxdiag                                 # 打开DirectX诊断工具
```

### 3.2 进程与服务管理

#### 进程管理
```cmd
tasklist                               # 显示所有运行的进程
tasklist /svc                          # 显示进程及其服务
tasklist /fi "imagename eq notepad.exe" # 过滤显示特定进程
taskkill /im notepad.exe               # 结束指定进程
taskkill /pid 1234                     # 根据PID结束进程
taskkill /f /im process.exe            # 强制结束进程
```

#### 服务管理
```cmd
sc query                               # 列出所有服务
sc query state= all                    # 列出所有状态的服务
sc start servicename                   # 启动服务
sc stop servicename                    # 停止服务
sc config servicename start= auto      # 设置服务自动启动
sc config servicename start= disabled  # 禁用服务
net start servicename                  # 启动服务（另一种方法）
net stop servicename                   # 停止服务（另一种方法）
```

### 3.3 性能监控

#### 系统性能
```cmd
perfmon                                # 打开性能监视器
resmon                                 # 打开资源监视器
typeperf "\Processor(_Total)\% Processor Time" # 监控CPU使用率
wmic process get name,processid,percentprocessortime # 查看进程CPU使用率
```

#### 内存使用情况
```cmd
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory # 查看内存使用情况
wmic process get name,processid,workingsetsize # 查看进程内存使用
```

## 四、网络诊断与配置

### 4.1 网络配置查看

#### IP配置信息
```cmd
ipconfig                               # 显示基本IP配置
ipconfig /all                          # 显示详细网络配置
ipconfig /release                      # 释放IP地址
ipconfig /renew                        # 重新获取IP地址
ipconfig /flushdns                     # 清除DNS缓存
ipconfig /displaydns                   # 显示DNS缓存内容
```

#### 网络接口信息
```cmd
netsh interface show interface         # 显示网络接口
netsh interface ip show config         # 显示IP配置
netsh wlan show profiles               # 显示无线网络配置文件
netsh wlan show profile name="WiFiName" key=clear # 显示WiFi密码
```

### 4.2 网络连通性测试

#### 基础连通性测试
```cmd
ping google.com                        # 测试网络连通性
ping -t google.com                     # 持续ping测试
ping -n 10 google.com                  # 指定ping次数
ping -l 1500 google.com                # 指定数据包大小
tracert google.com                     # 跟踪路由路径
pathping google.com                    # 结合ping和tracert的功能
```

#### 端口和连接测试
```cmd
telnet google.com 80                   # 测试端口连通性
netstat -an                            # 显示所有网络连接
netstat -an | find "LISTENING"         # 显示监听端口
netstat -b                             # 显示占用端口的程序
netstat -o                             # 显示进程ID
nslookup google.com                    # DNS查询
nslookup google.com 8.8.8.8           # 使用指定DNS服务器查询
```

### 4.3 网络故障排查

#### 网络诊断工具
```cmd
netsh winsock reset                    # 重置Winsock目录
netsh int ip reset                     # 重置TCP/IP协议栈
netsh advfirewall reset                # 重置防火墙设置
arp -a                                 # 显示ARP表
route print                            # 显示路由表
route add 0.0.0.0 mask 0.0.0.0 192.168.1.1 # 添加默认路由
```

## 五、磁盘与存储管理

### 5.1 磁盘信息查看

#### 磁盘空间
```cmd
dir /s                                 # 查看目录大小
fsutil volume diskfree C:              # 查看磁盘剩余空间
wmic logicaldisk get size,freespace,caption # 查看所有磁盘空间
```

#### 磁盘健康检查
```cmd
chkdsk C:                              # 检查磁盘错误
chkdsk C: /f                           # 修复磁盘错误
chkdsk C: /r                           # 恢复坏扇区
sfc /scannow                           # 系统文件检查器
dism /online /cleanup-image /checkhealth # 检查系统映像健康
dism /online /cleanup-image /restorehealth # 修复系统映像
```

### 5.2 磁盘管理

#### 磁盘分区
```cmd
diskpart                               # 打开磁盘分区工具
# 在diskpart中使用以下命令：
# list disk                            # 列出所有磁盘
# select disk 0                        # 选择磁盘
# list partition                       # 列出分区
# create partition primary size=10000  # 创建主分区
# active                               # 设置活动分区
# format fs=ntfs quick                 # 快速格式化
# assign letter=E                      # 分配驱动器号
```

#### 文件系统操作
```cmd
format C: /fs:ntfs                     # 格式化为NTFS
convert C: /fs:ntfs                    # 转换为NTFS文件系统
label C: "System"                      # 设置卷标
vol C:                                 # 显示卷标和序列号
```

## 六、用户与权限管理

### 6.1 用户账户管理

#### 用户操作
```cmd
net user                               # 列出所有用户账户
net user username                      # 显示用户详细信息
net user username password /add       # 创建新用户
net user username /delete              # 删除用户
net user username /active:yes          # 激活用户账户
net user username /active:no           # 禁用用户账户
net user username newpassword         # 修改用户密码
```

#### 组管理
```cmd
net localgroup                         # 列出所有本地组
net localgroup administrators          # 显示管理员组成员
net localgroup administrators username /add # 将用户添加到管理员组
net localgroup administrators username /delete # 从管理员组删除用户
```

### 6.2 权限管理

#### 文件权限
```cmd
icacls filename                        # 显示文件权限
icacls filename /grant username:F      # 授予完全控制权限
icacls filename /deny username:W       # 拒绝写入权限
icacls filename /remove username       # 移除用户权限
icacls filename /inheritance:r         # 移除继承权限
takeown /f filename                    # 获取文件所有权
```

## 七、注册表操作

### 7.1 注册表查看与编辑

#### 基本操作
```cmd
regedit                                # 打开注册表编辑器
reg query HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion # 查询注册表项
reg add HKCU\Software\MyApp /v Setting /t REG_SZ /d "Value" # 添加注册表值
reg delete HKCU\Software\MyApp /v Setting # 删除注册表值
reg export HKLM\SOFTWARE\MyApp backup.reg # 导出注册表
reg import backup.reg                  # 导入注册表
```

### 7.2 常用注册表位置

#### 系统配置相关
```cmd
# 查看Windows版本信息
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion"

# 查看已安装程序
reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"

# 查看启动项
reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"
reg query "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"
```

## 八、批处理脚本基础

### 8.1 批处理语法

#### 基本语法
```batch
@echo off                              # 关闭命令回显
echo Hello World                       # 输出文本
pause                                  # 暂停等待用户按键
rem This is a comment                  # 注释
:: This is also a comment              # 另一种注释方式

# 变量使用
set myvar=Hello
echo %myvar%                           # 输出变量值
set /p input=Enter your name:          # 获取用户输入
```

#### 条件判断
```batch
if exist filename.txt (
    echo File exists
) else (
    echo File not found
)

if "%1"=="" (
    echo No parameter provided
    goto :eof
)

if %errorlevel% equ 0 (
    echo Command succeeded
) else (
    echo Command failed
)
```

#### 循环结构
```batch
# for循环
for %%i in (*.txt) do echo %%i
for /l %%i in (1,1,10) do echo %%i
for /f "tokens=*" %%i in (file.txt) do echo %%i

# while循环（使用goto实现）
:loop
if condition (
    # do something
    goto loop
)
```

### 8.2 实用批处理示例

#### 系统清理脚本
```batch
@echo off
echo Starting system cleanup...

# 清理临时文件
del /s /q %temp%\*.*
del /s /q C:\Windows\Temp\*.*

# 清理回收站
rd /s /q C:\$Recycle.Bin

# 清理系统缓存
cleanmgr /sagerun:1

echo Cleanup completed!
pause
```

#### 网络诊断脚本
```batch
@echo off
echo Network Diagnostic Script
echo ========================

echo Checking network configuration...
ipconfig /all

echo.
echo Testing connectivity...
ping -n 4 8.8.8.8

echo.
echo Checking DNS resolution...
nslookup google.com

echo.
echo Network diagnostic completed!
pause
```

## 九、PowerShell高级命令

### 9.1 PowerShell基础

#### 基本概念
```powershell
# PowerShell是面向对象的，输出的是.NET对象
Get-Process                            # 获取进程列表
Get-Service                            # 获取服务列表
Get-EventLog -LogName System -Newest 10 # 获取系统事件日志
Get-Help Get-Process                   # 获取命令帮助
Get-Command *process*                  # 搜索包含process的命令
```

#### 管道和过滤
```powershell
# 管道操作
Get-Process | Where-Object {$_.CPU -gt 100} # 过滤CPU使用率高的进程
Get-Service | Where-Object {$_.Status -eq "Running"} # 过滤运行中的服务
Get-ChildItem C:\ | Sort-Object Length -Descending # 按大小排序文件

# 选择和格式化
Get-Process | Select-Object Name, CPU, Memory # 选择特定属性
Get-Service | Format-Table Name, Status -AutoSize # 格式化输出
Get-Process | Export-Csv processes.csv # 导出到CSV文件
```

### 9.2 系统管理PowerShell命令

#### 文件系统操作
```powershell
# 文件和目录操作
Get-ChildItem -Path C:\ -Recurse -Include "*.log" # 递归查找日志文件
New-Item -ItemType Directory -Path "C:\NewFolder" # 创建目录
Copy-Item -Path "source.txt" -Destination "dest.txt" # 复制文件
Remove-Item -Path "file.txt" -Force # 强制删除文件
Rename-Item -Path "old.txt" -NewName "new.txt" # 重命名文件

# 文件内容操作
Get-Content "file.txt"                 # 读取文件内容
Set-Content -Path "file.txt" -Value "Hello World" # 写入文件内容
Add-Content -Path "file.txt" -Value "New Line" # 追加内容
Select-String -Path "*.txt" -Pattern "error" # 在文件中搜索文本
```

#### 注册表操作
```powershell
# 注册表操作
Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion" # 读取注册表
Set-ItemProperty -Path "HKCU:\Software\MyApp" -Name "Setting" -Value "Value" # 设置注册表值
New-Item -Path "HKCU:\Software\MyApp" -Force # 创建注册表项
Remove-Item -Path "HKCU:\Software\MyApp" -Recurse # 删除注册表项
```

### 9.3 网络管理PowerShell命令

#### 网络配置
```powershell
# 网络适配器管理
Get-NetAdapter                         # 获取网络适配器信息
Get-NetIPAddress                       # 获取IP地址配置
Set-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress "192.168.1.100" # 设置静态IP
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress "192.168.1.100" -PrefixLength 24 # 添加IP地址
Remove-NetIPAddress -IPAddress "192.168.1.100" # 删除IP地址

# DNS配置
Get-DnsClientServerAddress             # 获取DNS服务器配置
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses "8.8.8.8","8.8.4.4" # 设置DNS
Clear-DnsClientCache                   # 清除DNS缓存
```

#### 网络诊断
```powershell
# 连通性测试
Test-NetConnection -ComputerName "google.com" -Port 80 # 测试端口连通性
Test-NetConnection -ComputerName "google.com" -TraceRoute # 跟踪路由
Resolve-DnsName "google.com"           # DNS解析
Get-NetTCPConnection                   # 获取TCP连接
Get-NetUDPEndpoint                     # 获取UDP端点
```

## 十、系统维护与优化

### 10.1 系统清理

#### 磁盘清理
```cmd
# 磁盘清理工具
cleanmgr                               # 打开磁盘清理工具
cleanmgr /sagerun:1                    # 运行预设的清理配置

# 手动清理
del /s /q %temp%\*.*                   # 清理临时文件
del /s /q C:\Windows\Temp\*.*          # 清理系统临时文件
del /s /q "C:\Users\%username%\AppData\Local\Temp\*.*" # 清理用户临时文件

# 清理系统文件
dism /online /cleanup-image /startcomponentcleanup # 清理组件存储
dism /online /cleanup-image /spsuperseded # 清理服务包备份
```

#### 注册表清理
```cmd
# 注册表清理（谨慎操作）
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "UnwantedStartup" /f
reg delete "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /v "UnwantedStartup" /f
```

### 10.2 系统优化

#### 启动项管理
```cmd
# 查看启动项
wmic startup get caption,command       # 查看启动程序
msconfig                               # 打开系统配置工具

# PowerShell方式
Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location
```

#### 服务优化
```cmd
# 禁用不必要的服务（示例）
sc config "Fax" start= disabled        # 禁用传真服务
sc config "TabletInputService" start= disabled # 禁用平板电脑输入服务
sc config "WSearch" start= disabled     # 禁用Windows搜索（可选）
```

### 10.3 性能监控

#### 系统性能计数器
```cmd
# 性能计数器
typeperf "\Processor(_Total)\% Processor Time" -sc 10 # 监控CPU使用率10次
typeperf "\Memory\Available MBytes" -sc 10 # 监控可用内存
typeperf "\PhysicalDisk(_Total)\% Disk Time" -sc 10 # 监控磁盘使用率
```

#### PowerShell性能监控
```powershell
# 系统性能监控
Get-Counter "\Processor(_Total)\% Processor Time" -SampleInterval 1 -MaxSamples 10
Get-Counter "\Memory\Available MBytes" -SampleInterval 1 -MaxSamples 10
Get-WmiObject -Class Win32_PerfRawData_PerfOS_Memory | Select-Object AvailableBytes
```

## 十一、故障排查与诊断

### 11.1 系统故障诊断

#### 事件日志分析
```cmd
# 事件查看器
eventvwr                               # 打开事件查看器

# 命令行查看事件日志
wevtutil qe System /c:10 /rd:true /f:text # 查看系统事件日志最新10条
wevtutil qe Application /c:10 /rd:true /f:text # 查看应用程序事件日志
wevtutil qe Security /c:10 /rd:true /f:text # 查看安全事件日志
```

#### PowerShell事件日志
```powershell
# 事件日志查询
Get-EventLog -LogName System -Newest 10 # 获取系统日志最新10条
Get-EventLog -LogName System -EntryType Error # 获取系统错误日志
Get-WinEvent -FilterHashtable @{LogName='System'; Level=2} # 获取系统错误事件
Get-WinEvent -FilterHashtable @{LogName='Application'; StartTime=(Get-Date).AddDays(-1)} # 获取最近一天的应用程序日志
```

### 11.2 网络故障排查

#### 网络连接诊断
```cmd
# 网络诊断步骤
ipconfig /all                          # 1. 检查网络配置
ping 127.0.0.1                        # 2. 测试本地回环
ping 192.168.1.1                      # 3. 测试网关连通性
ping 8.8.8.8                          # 4. 测试外网连通性
nslookup google.com                    # 5. 测试DNS解析

# 高级网络诊断
netsh int ip reset                     # 重置TCP/IP协议栈
netsh winsock reset                    # 重置Winsock目录
netsh advfirewall reset                # 重置防火墙
```

#### 网络性能测试
```powershell
# PowerShell网络测试
Test-NetConnection -ComputerName "google.com" -InformationLevel Detailed
Test-NetConnection -ComputerName "192.168.1.1" -Port 80 -InformationLevel Detailed
Measure-Command {Test-NetConnection -ComputerName "google.com"} # 测试连接时间
```

### 11.3 硬件故障诊断

#### 内存测试
```cmd
mdsched                                # 启动Windows内存诊断工具
```

#### 硬盘健康检查
```cmd
# 硬盘检查
chkdsk C: /f /r                        # 全面检查并修复C盘
wmic diskdrive get status              # 查看硬盘状态
fsutil dirty query C:                  # 查看磁盘是否标记为脏

# SMART信息查看
wmic diskdrive get model,serialnumber,size,status # 查看硬盘基本信息
```

#### 系统文件完整性检查
```cmd
sfc /scannow                           # 系统文件检查器
sfc /verifyonly                        # 仅验证不修复
dism /online /cleanup-image /checkhealth # 检查系统映像健康
dism /online /cleanup-image /scanhealth # 扫描系统映像
dism /online /cleanup-image /restorehealth # 修复系统映像
```

## 十二、安全管理命令

### 12.1 防火墙管理

#### Windows防火墙
```cmd
# 防火墙状态
netsh advfirewall show allprofiles     # 显示所有配置文件状态
netsh advfirewall set allprofiles state on # 启用所有配置文件的防火墙
netsh advfirewall set allprofiles state off # 禁用所有配置文件的防火墙

# 防火墙规则
netsh advfirewall firewall show rule name=all # 显示所有防火墙规则
netsh advfirewall firewall add rule name="Allow Port 80" dir=in action=allow protocol=TCP localport=80 # 添加入站规则
netsh advfirewall firewall delete rule name="Allow Port 80" # 删除规则
```

#### PowerShell防火墙管理
```powershell
# 防火墙管理
Get-NetFirewallProfile                 # 获取防火墙配置文件
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True # 启用防火墙
Get-NetFirewallRule                    # 获取防火墙规则
New-NetFirewallRule -DisplayName "Allow Port 80" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow # 创建防火墙规则
Remove-NetFirewallRule -DisplayName "Allow Port 80" # 删除防火墙规则
```

### 12.2 用户账户控制

#### UAC管理
```cmd
# 查看UAC状态
reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" /v EnableLUA

# 修改UAC设置（需要管理员权限）
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" /v EnableLUA /t REG_DWORD /d 0 /f # 禁用UAC
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" /v EnableLUA /t REG_DWORD /d 1 /f # 启用UAC
```

### 12.3 系统安全审计

#### 安全策略
```cmd
# 本地安全策略
secpol.msc                             # 打开本地安全策略
gpedit.msc                             # 打开组策略编辑器

# 安全审计
auditpol /get /category:*              # 查看审计策略
auditpol /set /category:"Logon/Logoff" /success:enable /failure:enable # 设置登录审计
```

#### 权限审计
```powershell
# 文件权限审计
Get-Acl "C:\ImportantFolder" | Format-List # 查看文件夹权限
Get-ChildItem "C:\ImportantFolder" | Get-Acl | Select-Object Path, Owner, AccessToString # 批量查看权限
```

## 十三、自动化脚本示例

### 13.1 系统维护脚本

#### 完整的系统维护脚本
```batch
@echo off
title System Maintenance Script
color 0A

echo ========================================
echo    Windows System Maintenance Script
echo ========================================
echo.

echo [1/6] Checking system files...
sfc /scannow

echo.
echo [2/6] Cleaning temporary files...
del /s /q %temp%\*.*
del /s /q C:\Windows\Temp\*.*
del /s /q "C:\Users\%username%\AppData\Local\Temp\*.*"

echo.
echo [3/6] Cleaning system cache...
dism /online /cleanup-image /startcomponentcleanup

echo.
echo [4/6] Checking disk for errors...
echo Y | chkdsk C: /f

echo.
echo [5/6] Updating Windows Defender definitions...
"%ProgramFiles%\Windows Defender\MpCmdRun.exe" -SignatureUpdate

echo.
echo [6/6] Generating system report...
systeminfo > "%userprofile%\Desktop\SystemReport_%date:~-4,4%%date:~-10,2%%date:~-7,2%.txt"

echo.
echo ========================================
echo    System maintenance completed!
echo    Report saved to Desktop
echo ========================================
pause
```

### 13.2 PowerShell自动化脚本

#### 系统信息收集脚本
```powershell
# System Information Collection Script
$OutputPath = "$env:USERPROFILE\Desktop\SystemInfo_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"

"Windows System Information Report" | Out-File $OutputPath
"Generated on: $(Get-Date)" | Out-File $OutputPath -Append
"=" * 50 | Out-File $OutputPath -Append

# 系统基本信息
"SYSTEM INFORMATION" | Out-File $OutputPath -Append
"-" * 20 | Out-File $OutputPath -Append
Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion, TotalPhysicalMemory, CsProcessors | Out-File $OutputPath -Append

# 磁盘信息
"`nDISK INFORMATION" | Out-File $OutputPath -Append
"-" * 20 | Out-File $OutputPath -Append
Get-WmiObject -Class Win32_LogicalDisk | Select-Object DeviceID, Size, FreeSpace, @{Name="FreePercent";Expression={[math]::Round(($_.FreeSpace/$_.Size)*100,2)}} | Out-File $OutputPath -Append

# 网络信息
"`nNETWORK INFORMATION" | Out-File $OutputPath -Append
"-" * 20 | Out-File $OutputPath -Append
Get-NetAdapter | Where-Object {$_.Status -eq "Up"} | Select-Object Name, InterfaceDescription, LinkSpeed | Out-File $OutputPath -Append

# 服务信息
"`nRUNNING SERVICES" | Out-File $OutputPath -Append
"-" * 20 | Out-File $OutputPath -Append
Get-Service | Where-Object {$_.Status -eq "Running"} | Select-Object Name, DisplayName | Out-File $OutputPath -Append

Write-Host "System information report generated: $OutputPath" -ForegroundColor Green
```

## 十四、学习资源与最佳实践

### 14.1 学习资源

#### 官方文档
- **Microsoft Docs**: https://docs.microsoft.com/en-us/windows-server/
- **PowerShell Documentation**: https://docs.microsoft.com/en-us/powershell/
- **Windows Commands Reference**: https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/

#### 在线学习平台
- **Microsoft Learn**: 免费的官方学习平台
- **PowerShell Gallery**: PowerShell模块和脚本资源
- **TechNet**: 技术社区和资源

### 14.2 最佳实践

#### 命令行使用技巧
1. **使用Tab键自动补全**：提高输入效率
2. **使用历史命令**：按上下箭头键查看历史
3. **使用管道组合命令**：提高工作效率
4. **定期备份重要配置**：避免误操作损失
5. **测试脚本**：在生产环境前充分测试

#### 安全注意事项
1. **谨慎使用管理员权限**：避免不必要的风险
2. **备份注册表**：修改前先备份
3. **验证命令参数**：避免误删重要文件
4. **定期更新系统**：保持安全补丁最新
5. **监控系统日志**：及时发现异常

### 14.3 故障排查流程

#### 系统性故障排查步骤
```
1. 问题识别
   ├── 收集错误信息
   ├── 确定影响范围
   └── 记录问题现象

2. 初步诊断
   ├── 检查系统日志
   ├── 验证基本功能
   └── 排除硬件问题

3. 深入分析
   ├── 使用诊断工具
   ├── 分析性能数据
   └── 检查配置文件

4. 解决方案
   ├── 制定修复计划
   ├── 实施解决方案
   └── 验证修复效果

5. 预防措施
   ├── 更新文档
   ├── 改进监控
   └── 制定预防策略
```

## 十五、总结

### 15.1 核心要点回顾

#### Windows命令行的价值
1. **高效管理**：批量操作和自动化任务
2. **故障排查**：快速诊断和解决问题
3. **系统监控**：实时监控系统状态
4. **远程管理**：通过命令行远程管理系统

#### 掌握重点
- **基础命令**：文件操作、系统信息、网络诊断
- **高级功能**：PowerShell脚本、自动化任务
- **故障排查**：系统诊断、日志分析、性能监控
- **安全管理**：权限控制、防火墙配置

### 15.2 学习建议

#### 循序渐进的学习路径
1. **基础阶段**：掌握常用CMD命令
2. **进阶阶段**：学习PowerShell和脚本编写
3. **高级阶段**：系统管理和故障排查
4. **专家阶段**：自动化和高级诊断

#### 实践建议
- **动手实践**：在虚拟机中练习命令
- **编写脚本**：自动化日常任务
- **解决问题**：用命令行解决实际问题
- **持续学习**：关注新功能和最佳实践

Windows命令行是系统管理员和高级用户的重要工具。通过系统学习和实践，你将能够高效地管理Windows系统，快速排查故障，并实现任务自动化。记住，熟练掌握这些命令需要时间和实践，但投入的努力将会带来巨大的回报！

愿这份Windows命令大全能够成为你系统管理路上的得力助手！💻✨
