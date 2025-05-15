---
title: 【LINUX】服务器常用命令
categories: LINUX
tags:
  - 部署
  - 工作
  - LINUX
  - SHELL
---

# 后端常用命令

## 启动jar包命令

- 直接启动

```
nohup java -jar web.jar > web.out 2>&1 &
```

- 在jar包同级创建文件夹config，然后用config中的配置文件启动

```
nohup java -Dfile.encoding=UTF-8 -jar web.jar --spring.config.location=file:./config/ > web.out 2>&1 &
```

# 数据库常用命令

## 导出/备份MYSQL数据库

- 先cd到要存储备份文件的文件夹
- 然后执行备份命令

### （一）基本备份命令

```shell
# 导出整个数据库
mysqldump -u [用户名] -p [数据库名] > [导出文件名].sql

# 示例：导出名为 mydb 的数据库到 backup.sql
mysqldump -u root -p mydb > mydb_backup.sql
```

- 输入密码后即可导出数据

### （二）导出特定表

```shell
# 导出数据库中的特定表
mysqldump -u [用户名] -p [数据库名] [表名1] [表名2] > [导出文件名].sql

# 示例：导出 mydb 数据库中的 users 和 orders 表
mysqldump -u root -p mydb users orders > mydb_tables_backup.sql
```

### （三）仅导出数据库结构（不含数据）

```shell
# 仅导出数据库结构，不包含数据
mysqldump -u [用户名] -p --no-data [数据库名] > [导出文件名]_structure.sql

# 示例：仅导出 mydb 数据库结构
mysqldump -u root -p --no-data mydb > mydb_structure.sql
```

### （四）仅导出数据（不含结构）

```shell
# 仅导出数据，不包含表结构
mysqldump -u [用户名] -p --no-create-info [数据库名] > [导出文件名]_data.sql

# 示例：仅导出 mydb 数据库数据
mysqldump -u root -p --no-create-info mydb > mydb_data.sql
```

### （五）导出带条件的数据

```shell
# 使用 WHERE 条件导出特定数据
mysqldump -u [用户名] -p [数据库名] [表名] --where="[条件]" > [导出文件名].sql

# 示例：导出 users 表中 id 大于 1000 的记录
mysqldump -u root -p mydb users --where="id > 1000" > users_filtered.sql
```

### （六）导出时添加额外选项

```shell
# 添加 DROP TABLE 语句（如果表存在则先删除）
mysqldump -u [用户名] -p --add-drop-table [数据库名] > [导出文件名].sql

# 导出存储过程和函数
mysqldump -u [用户名] -p --routines [数据库名] > [导出文件名].sql

# 导出触发器
mysqldump -u [用户名] -p --triggers [数据库名] > [导出文件名].sql

# 导出事件
mysqldump -u [用户名] -p --events [数据库名] > [导出文件名].sql

# 完整备份（包含存储过程、函数、触发器和事件）
mysqldump -u [用户名] -p --routines --triggers --events [数据库名] > [导出文件名]_full.sql
```

## 恢复/导入MYSQL数据库

- 先cd到备份文件的目录

### （一）基本恢复命令

```shell
# 创建数据库（如果不存在）
mysql -u root -p -e "CREATE DATABASE mydb;"

# 恢复整个数据库
mysql -u [用户名] -p [数据库名] < [备份文件].sql

# 示例：恢复 mydb_backup.sql 到 mydb 数据库
mysql -u root -p mydb < mydb_backup.sql
```

### （二）导入时指定字符集

```shell
# 指定字符集导入数据
mysql -u [用户名] -p --default-character-set=utf8mb4 [数据库名] < [备份文件].sql

# 示例：使用 utf8mb4 字符集导入数据
mysql -u root -p --default-character-set=utf8mb4 mydb < mydb_backup.sql
```

### （三）导入大型数据库的优化方法

```shell
# 对于大型数据库，可以使用以下方式提高导入速度
mysql -u [用户名] -p [数据库名] --init-command="SET autocommit=0;" < [备份文件].sql

# 或者在导入前禁用外键检查
mysql -u [用户名] -p -e "SET GLOBAL foreign_key_checks=0;" && \
mysql -u [用户名] -p [数据库名] < [备份文件].sql && \
mysql -u [用户名] -p -e "SET GLOBAL foreign_key_checks=1;"
```

### （四）使用source命令导入

```shell
# 先登录到MySQL
mysql -u [用户名] -p

# 然后在MySQL命令行中执行
mysql> USE [数据库名];
mysql> SOURCE [备份文件].sql;

# 示例
mysql> USE mydb;
mysql> SOURCE /path/to/mydb_backup.sql;
```

### （五）导入特定表数据

如果备份文件只包含特定表的数据，可以直接导入到目标数据库：

```shell
# 导入包含特定表的备份文件
mysql -u [用户名] -p [数据库名] < [特定表备份文件].sql

# 示例：导入只包含users表的备份
mysql -u root -p mydb < users_backup.sql
```

### （六）导入时显示进度

对于大型数据库，可以使用pv工具显示导入进度：

```shell
# 先安装pv工具
apt-get install pv  # Debian/Ubuntu
# 或
yum install pv      # CentOS/RHEL

# 使用pv显示导入进度
pv [备份文件].sql | mysql -u [用户名] -p [数据库名]

# 示例
pv mydb_backup.sql | mysql -u root -p mydb
```

# Linux压缩包命令

## 常用压缩与解压命令

Linux系统中处理压缩文件的命令多种多样，下面笔者整理了最常用的压缩解压命令及其用法。

### （一）tar 命令

`tar`是Linux中最常用的归档工具，可以配合不同的压缩算法使用。

#### 1. 常用参数说明

```shell
-c：创建新的归档文件
-x：从归档文件中提取文件
-v：详细显示处理的文件
-f：指定归档文件名
-z：使用gzip压缩（.tar.gz或.tgz）
-j：使用bzip2压缩（.tar.bz2）
-J：使用xz压缩（.tar.xz）
-C：切换到指定目录
```

#### 2. 创建归档/压缩文件

```shell
# 创建tar归档（不压缩）
tar -cvf archive.tar folder/

# 创建tar.gz压缩包
tar -czvf archive.tar.gz folder/

# 创建tar.bz2压缩包（压缩率更高但更慢）
tar -cjvf archive.tar.bz2 folder/

# 创建tar.xz压缩包（压缩率最高但最慢）
tar -cJvf archive.tar.xz folder/

# 排除某些文件
tar -czvf archive.tar.gz folder/ --exclude="folder/temp" --exclude="*.log"
```

#### 3. 解压归档文件

```shell
# 解压tar归档
tar -xvf archive.tar

# 解压tar.gz
tar -xzvf archive.tar.gz

# 解压tar.bz2
tar -xjvf archive.tar.bz2

# 解压tar.xz
tar -xJvf archive.tar.xz

# 解压到指定目录
tar -xzvf archive.tar.gz -C /target/directory/
```

#### 4. 查看压缩包内容（不解压）

```shell
# 列出归档内容
tar -tvf archive.tar

# 列出压缩归档内容
tar -tzvf archive.tar.gz
```

### （二）gzip/gunzip 命令

`gzip`命令用于压缩单个文件，不能直接压缩目录。

#### 1. 压缩文件

```shell
# 压缩文件（会删除原文件）
gzip file.txt

# 保留原文件
gzip -c file.txt > file.txt.gz

# 压缩多个文件
gzip file1.txt file2.txt file3.txt

# 指定压缩级别（1-9，1最快，9压缩比最高）
gzip -9 file.txt
```

#### 2. 解压文件

```shell
# 解压文件（会删除.gz文件）
gunzip file.txt.gz

# 或使用gzip -d
gzip -d file.txt.gz

# 保留.gz文件
gunzip -c file.txt.gz > file.txt
```

### （三）zip/unzip 命令

`zip`命令在跨平台场景中很有用，尤其是与Windows系统交互时。

#### 1. 压缩文件或目录

```shell
# 压缩单个文件
zip compressed.zip file.txt

# 压缩目录（递归）
zip -r compressed.zip directory/

# 排除特定文件
zip -r compressed.zip directory/ -x "*.git*" "*.log"

# 添加文件到已有的zip
zip -u compressed.zip newfile.txt
```

#### 2. 解压文件

```shell
# 解压到当前目录
unzip compressed.zip

# 解压到指定目录
unzip compressed.zip -d /target/directory/

# 列出内容但不解压
unzip -l compressed.zip

# 解压特定文件
unzip compressed.zip file.txt

# 安静模式
unzip -q compressed.zip
```

### （四）bzip2/bunzip2 命令

`bzip2`提供比`gzip`更高的压缩率，但速度较慢。

```shell
# 压缩文件
bzip2 file.txt

# 保留原文件
bzip2 -k file.txt

# 解压文件
bunzip2 file.txt.bz2

# 或使用bzip2 -d
bzip2 -d file.txt.bz2
```

### （五）xz 命令

`xz`提供极高的压缩率，但速度最慢。

```shell
# 压缩文件
xz file.txt

# 保留原文件
xz -k file.txt

# 解压文件
xz -d file.txt.xz

# 使用多线程加速压缩（使用4线程）
xz -T 4 file.txt
```

### （六）7z 命令

`7z`是一个高压缩率的跨平台归档工具。

```shell
# 安装7zip
apt-get install p7zip-full  # Debian/Ubuntu
yum install p7zip p7zip-plugins  # CentOS/RHEL

# 创建压缩包
7z a archive.7z files/

# 解压
7z x archive.7z

# 列出内容
7z l archive.7z
```

## 压缩包操作实用技巧

### （一）分割大型归档文件

```shell
# 使用split命令分割大文件
tar -czvf - large_folder/ | split -b 1G - large_archive.tar.gz.part_

# 合并并解压
cat large_archive.tar.gz.part_* | tar -xzvf -
```

### （二）通过管道传输远程归档

```shell
# 压缩本地目录并通过SSH发送到远程服务器
tar -czvf - local_folder/ | ssh user@remote_host "cat > /path/to/archive.tar.gz"

# 从远程服务器获取并解压归档
ssh user@remote_host "cat /path/to/archive.tar.gz" | tar -xzvf - -C /local/target/
```

### （三）结合find命令压缩特定文件

```shell
# 压缩所有30天前的.log文件
find /var/log -name "*.log" -mtime +30 | tar -czvf old_logs.tar.gz -T -

# -T - 表示从标准输入读取文件名列表
```

### （四）快速比较压缩算法

对相同数据使用不同压缩方式，可以比较压缩率和速度：

```shell
# 创建测试数据
cp -r /some/directory test_data

# tar（无压缩）
time tar -cf test.tar test_data/
du -h test.tar

# gzip压缩
time tar -czf test.tar.gz test_data/
du -h test.tar.gz

# bzip2压缩
time tar -cjf test.tar.bz2 test_data/
du -h test.tar.bz2

# xz压缩
time tar -cJf test.tar.xz test_data/
du -h test.tar.xz
```

不同的压缩工具适用于不同的场景，选择合适的压缩方式可以提高工作效率：
- 日常备份文件：tar.gz (速度与压缩率平衡)
- 需要极致压缩率：tar.xz (适用于长期存档)
- 与Windows用户交换：zip (兼容性最好)
- 大型数据备份传输：tar.bz2 (压缩率高且广泛支持)

# Linux日志查询技巧

Linux系统的日志文件包含了系统运行、应用程序执行和用户操作等重要信息，掌握高效的日志查询技巧对于故障排查和系统维护至关重要。下面笔者总结了一些常用的日志查询方法和技巧。

## 常用日志文件位置

### （一）系统日志位置

```shell
/var/log/syslog          # Debian/Ubuntu系统主日志文件
/var/log/messages        # CentOS/RHEL系统主日志文件
/var/log/auth.log        # 认证相关日志(Debian/Ubuntu)
/var/log/secure          # 认证相关日志(CentOS/RHEL)
/var/log/boot.log        # 系统启动日志
/var/log/dmesg           # 内核缓冲区信息
/var/log/kern.log        # 内核日志
/var/log/cron            # 计划任务日志
/var/log/httpd/          # Apache日志目录
/var/log/nginx/          # Nginx日志目录
/var/log/mysql/          # MySQL日志目录
/var/log/audit/          # 审计日志
```

### （二）应用程序日志位置

应用程序日志通常保存在以下位置之一：

```shell
/var/log/[应用程序名称]/    # 应用程序专用日志目录
/opt/[应用程序]/logs/      # 自定义安装的应用程序日志
/usr/local/[应用程序]/logs/ # 本地安装的应用日志
~/.local/share/[应用程序]/ # 用户级应用程序日志
```

## 基本日志查看命令

### （一）cat、head、tail命令

```shell
# 查看整个日志文件
cat /var/log/syslog

# 查看日志文件的前20行
head -n 20 /var/log/syslog

# 查看日志文件的最后20行
tail -n 20 /var/log/syslog

# 实时查看日志更新（最常用）
tail -f /var/log/syslog

# 从第1000行开始显示
tail -n +1000 /var/log/syslog

# 同时监控多个日志文件
tail -f /var/log/syslog /var/log/auth.log
```

### （二）less命令（交互式查看）

```shell
less /var/log/syslog
```

less命令常用的交互式操作：

- 空格键/PageDown：向下翻页
- b/PageUp：向上翻页
- g：跳到文件开头
- G：跳到文件结尾
- /pattern：搜索指定模式
- n：查找下一个匹配
- N：查找上一个匹配
- q：退出

### （三）grep命令（搜索过滤）

```shell
# 基本搜索
grep "error" /var/log/syslog

# 忽略大小写
grep -i "error" /var/log/syslog

# 显示匹配行的行号
grep -n "error" /var/log/syslog

# 显示匹配行及其前后各3行
grep -A 3 -B 3 "error" /var/log/syslog

# 递归搜索目录中的所有文件
grep -r "error" /var/log/

# 使用正则表达式
grep -E "error|warning" /var/log/syslog

# 只显示匹配的部分
grep -o "error [0-9]+" /var/log/syslog

# 反向匹配（排除某些行）
grep -v "debug" /var/log/syslog

# 统计匹配行数
grep -c "error" /var/log/syslog
```

### （四）awk和sed命令（高级处理）

```shell
# 使用awk提取特定列
awk '{print $1, $3, $9}' /var/log/nginx/access.log

# 按时间过滤日志
awk '/2023-10-15 10:2[0-9]/' /var/log/syslog

# 使用sed替换文本
sed 's/error/ERROR/g' /var/log/syslog

# 提取IP地址
grep -o '[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}' /var/log/nginx/access.log
```

## 高级日志查询技巧

### （一）按时间范围查询

```shell
# 提取特定日期的日志
grep "Oct 15" /var/log/syslog

# 提取特定时间范围的日志
grep -E "Oct 15 (1[0-1]|10):[0-9][0-9]" /var/log/syslog

# 使用sed提取时间范围
sed -n '/2023-10-15 10:00:00/,/2023-10-15 11:00:00/p' /var/log/app.log
```

### （二）过滤多个条件

```shell
# 同时满足多个条件（AND逻辑）
grep "error" /var/log/syslog | grep "database"

# 满足任一条件（OR逻辑）
grep -E "error|warning" /var/log/syslog

# 复杂条件组合
grep "error" /var/log/syslog | grep -v "expected" | grep -E "database|disk"
```

### （三）组合使用多个命令

```shell
# 查看最近10分钟的系统错误
journalctl --since "10 minutes ago" | grep -i error

# 分析HTTP 500错误
grep "HTTP/1.1\" 500" /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -nr

# 提取特定的请求路径
grep "POST" /var/log/nginx/access.log | cut -d '"' -f 2 | sort | uniq -c | sort -nr

# 查找耗时最长的请求
grep -v "static" /var/log/nginx/access.log | awk '{print $NF " " $7}' | sort -nr | head -n 20
```

### （四）日志颜色高亮

使用`ccze`或`grc`工具为日志添加颜色：

```shell
# 安装工具
apt-get install ccze  # Debian/Ubuntu
yum install ccze      # CentOS/RHEL

# 实时彩色查看日志
tail -f /var/log/syslog | ccze -A

# 或者使用grc
grc tail -f /var/log/syslog
```

### （五）使用journalctl（systemd日志）

对于使用systemd的系统，可以使用journalctl命令查询日志：

```shell
# 查看系统所有日志
journalctl

# 查看特定服务的日志
journalctl -u nginx.service
journalctl -u ssh.service

# 按时间过滤
journalctl --since "2023-10-15 10:00:00" --until "2023-10-15 11:00:00"
journalctl --since "1 hour ago"

# 查看内核日志
journalctl -k

# 实时查看
journalctl -f

# 按优先级过滤
journalctl -p err..alert

# 输出格式化为JSON
journalctl -o json
```

## 日志分析和监控工具

### （一）常用日志分析工具

```shell
# 安装工具
apt-get install logwatch lnav goaccess  # Debian/Ubuntu
yum install logwatch lnav goaccess      # CentOS/RHEL

# logwatch生成日志摘要报告
logwatch --output stdout --format html --range yesterday --detail high

# lnav交互式日志查看器
lnav /var/log/syslog /var/log/auth.log

# goaccess分析Web服务器日志
goaccess /var/log/nginx/access.log -c
```

### （二）创建日志分析脚本

简单的日志错误统计脚本示例：

```bash
#!/bin/bash

LOG_FILE="/var/log/syslog"
ERROR_PATTERN="error|ERROR|fail|FAIL|critical"

echo "==== 日志错误统计 ===="
echo "分析文件: $LOG_FILE"
echo

echo "错误总数:"
grep -E "$ERROR_PATTERN" "$LOG_FILE" | wc -l

echo -e "\n错误类型统计:"
grep -Eo "$ERROR_PATTERN[a-zA-Z0-9:_ ]*" "$LOG_FILE" | sort | uniq -c | sort -nr | head -10

echo -e "\n最近10条错误:"
grep -E "$ERROR_PATTERN" "$LOG_FILE" | tail -10

echo -e "\n错误发生时间分布:"
grep -E "$ERROR_PATTERN" "$LOG_FILE" | awk '{print $1, $2, $3}' | sort | uniq -c
```

## 日志查询实用场景

### （一）查询登录失败尝试

```shell
# 查找SSH登录失败
grep "Failed password" /var/log/auth.log

# 统计攻击IP
grep "Failed password" /var/log/auth.log | awk '{print $(NF-3)}' | sort | uniq -c | sort -nr

# 查看用户尝试登录
grep "Failed password" /var/log/auth.log | awk '{print $(NF-5)}' | sort | uniq -c
```

### （二）检查系统关键错误

```shell
# 查找OOM (Out of Memory)错误
grep -i "out of memory" /var/log/syslog

# 查找磁盘错误
grep -i "I/O error" /var/log/syslog /var/log/kern.log

# 查找硬件故障
grep -i "hardware error" /var/log/syslog /var/log/kern.log

# 查找启动问题
grep -i "fail" /var/log/boot.log
```

### （三）分析Web服务器访问日志

```shell
# 查看访问量最大的IP
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10

# 查看访问最多的页面
awk '{print $7}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10

# 统计HTTP状态码
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -nr

# 查找爬虫请求
grep -i "bot" /var/log/nginx/access.log | awk '{print $1, $14, $15, $16}' | sort | uniq -c

# 分析特定时间段的流量
grep "15/Oct/2023:10" /var/log/nginx/access.log | wc -l
```

### （四）监控应用程序错误

```shell
# 查找Java应用异常
grep -A 10 "Exception" /path/to/application.log | less

# 查找应用程序的严重错误
grep -i "fatal\|critical\|severe" /path/to/application.log

# 按时间范围分析应用错误趋势
grep "ERROR" /path/to/application.log | awk '{print $1,$2}' | sort | uniq -c
```

## 日志管理最佳实践

### （一）日志轮转

确保系统正确配置logrotate以管理日志文件大小：

```shell
# 检查配置
cat /etc/logrotate.conf
ls -l /etc/logrotate.d/

# 手动轮转日志
logrotate -f /etc/logrotate.conf
```

### （二）日志聚合

对于多服务器环境，考虑使用集中式日志管理：

```shell
# 使用rsyslog发送日志到中央服务器
echo "*.* @logserver.example.com:514" >> /etc/rsyslog.conf
systemctl restart rsyslog

# 或者使用现代日志栈(ELK, Graylog等)
```

### （三）定期日志审查

创建定期审查关键日志的计划任务：

```shell
# 创建每日日志摘要邮件
30 7 * * * /usr/sbin/logwatch --output mail --mailto admin@example.com --detail high
```

通过掌握这些日志查询和分析技巧，可以更快地发现系统问题、排查故障并提高系统的稳定性与安全性。