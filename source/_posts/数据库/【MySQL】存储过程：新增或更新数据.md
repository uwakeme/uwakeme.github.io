---
title: 【MySQL】存储过程：新增或更新数据
tags:
  - MySQL
  - 存储过程
  - DBEAVER
categories: MySQL
date: 2024-11-11 17:43:42
---


# 存储过程：新增或更新数据

```mysql
CREATE DEFINER=`root`@`%` PROCEDURE `database`.`UpdateOrInsertReviseHistory`(
    IN p_file_number VARCHAR(255),
    IN p_version_id VARCHAR(255),
    IN p_effect_date DATETIME,
    IN p_revise_content TEXT
)
BEGIN
    -- 检查记录是否存在
    IF EXISTS (SELECT 1 FROM revise_history WHERE file_number = p_file_number AND version_id = p_version_id) THEN
        -- 如果存在则更新
        IF p_revise_content IS NOT NULL AND p_revise_content != '' THEN
            -- 如果 revise_content 不为空，更新 revise_content 和 effect_date
            UPDATE revise_history 
            SET effect_date = p_effect_date,
                revise_content = p_revise_content
            WHERE file_number = p_file_number AND version_id = p_version_id;
        ELSE
            -- 如果 revise_content 为空，仅更新 effect_date
            UPDATE revise_history 
            SET effect_date = p_effect_date
            WHERE file_number = p_file_number AND version_id = p_version_id;
        END IF;
    ELSE
        -- 如果不存在则插入
        IF p_revise_content IS NOT NULL AND p_revise_content != '' THEN
            -- 如果 revise_content 不为空，插入 revise_content 和 effect_date
            INSERT INTO revise_history (file_number, revise_content, version_id, effect_date, is_write)
            VALUES (p_file_number, p_revise_content, p_version_id, p_effect_date, '1');
        ELSE
            -- 如果 revise_content 为空，仅插入 effect_date
            INSERT INTO revise_history (file_number, version_id, effect_date, is_write)
            VALUES (p_file_number, p_version_id, p_effect_date, '1');
        END IF;
    END IF;
END
```

