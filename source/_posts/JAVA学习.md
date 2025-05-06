---
title: JAVA学习
date: 2024/8/28
tags:
  - java
  - MYBATISPLUS
categories: 工作经验
---



# Part1 MybatisPlus

## 1-1 Lambda用法

+ lambda表达式可以通过方法引用的方式来使用实体字段名的操作，避免直接写数据库表字段名时的错写名字 

```java
@PostMapping(value = "/listTaskRecordInfoWorkBench")
public Map<String, Object> listTaskRecordInfoWorkBench(@RequestBody Map<String,String> param) {
    Map<String, Object> result = new HashMap<>(3);
    String recordNoteId = param.get("recordNoteId");

    String taskName = param.get("taskName");
    String taskRecordNum = param.get("taskRecordNum");
    String taskRecordName = param.get("taskRecordName");
    String templateName = param.get("templateName");
    String keyword = param.get("keyword");
    String recordNoteNum = param.get("recordNoteNum");
    String projectName = param.get("projectName");
    String projectCode = param.get("projectCode");
    String projectTaskName = param.get("projectTaskName");
    String projectTaskId = param.get("projectTaskId");
    String creator = param.get("creator");
    String createDateStart = param.get("createDateStart");
    String createDateEnd = param.get("createDateEnd");
    String curuserid = ShiroKit.getUser().getId();

    Page<TaskRecordInfo> pager = new Page<>(-1, -1);
    QueryWrapper<TaskRecordInfo> queryWrapper = new QueryWrapper<>();
    queryWrapper.lambda().eq(!StringUtils.isEmpty(recordNoteId),TaskRecordInfo::getRecordNoteId,recordNoteId);
    queryWrapper.lambda().eq(!StringUtils.isEmpty(taskName),TaskRecordInfo::getTaskName,taskName);
    queryWrapper.lambda().like(!StringUtils.isEmpty(taskRecordNum),TaskRecordInfo::getTaskRecordNum,taskRecordNum);
    queryWrapper.lambda().like(!StringUtils.isEmpty(taskRecordName),TaskRecordInfo::getTaskRecordName,taskRecordName);
    queryWrapper.lambda().like(!StringUtils.isEmpty(templateName),TaskRecordInfo::getTemplateName,templateName);
    queryWrapper.lambda().like(!StringUtils.isEmpty(keyword),TaskRecordInfo::getKeyword,keyword);
    queryWrapper.lambda().like(!StringUtils.isEmpty(recordNoteNum),TaskRecordInfo::getRecordNoteNum,recordNoteNum);
    queryWrapper.lambda().like(!StringUtils.isEmpty(projectName),TaskRecordInfo::getProjectName,projectName);
    queryWrapper.lambda().like(!StringUtils.isEmpty(projectCode),TaskRecordInfo::getProjectCode,projectCode);
    queryWrapper.lambda().like(!StringUtils.isEmpty(projectTaskName),TaskRecordInfo::getProjectTaskName,projectTaskName);
    queryWrapper.lambda().eq(!StringUtils.isEmpty(projectTaskId),TaskRecordInfo::getProjectTaskId,projectTaskId);
    queryWrapper.lambda().like(!StringUtils.isEmpty(creator),TaskRecordInfo::getCreator,creator);
    queryWrapper.lambda().ge(!StringUtils.isEmpty(createDateStart),TaskRecordInfo::getCreateDate,createDateStart);
    queryWrapper.lambda().le(!StringUtils.isEmpty(createDateEnd),TaskRecordInfo::getCreateDate,createDateEnd);

    String[] tasknamearr = {"执行","退回"};
    queryWrapper.lambda().in(TaskRecordInfo::getTaskName,tasknamearr);
    queryWrapper.lambda().eq(TaskRecordInfo::getCreatorId,curuserid);
    queryWrapper.and(temp -> temp.lambda().ne(TaskRecordInfo::getTaskType,"转交")
                     .or().isNull(TaskRecordInfo::getTaskType));
    queryWrapper.lambda().orderByDesc(TaskRecordInfo::getTaskName).orderByDesc(TaskRecordInfo::getCreateDate);
    List<TaskRecordInfo> list = taskRecordInfoService.page(pager,queryWrapper).getRecords();
    result.put("count", pager.getTotal());
    result.put("data", list);
    result.put("code", "0");
    return result;
}
```



## 1-2 and | or

+ 默认为 and 连接
+ or的用法
  + eq("id",1).or().eq("name","老王")  --->  id = 1 or name = '老王'
  + or(i -> i.eq("name", "李白").ne("status", "活着"))  --->  or (name = '李白' and status <> '活着')



## 1-3 忽略判断空值，null也更新到数据库 

+ 需要在字段前添加注解

+ ```java
  @TableField(value = "WEIGH_COUNT",updateStrategy = FieldStrategy.IGNORED)
  ```



# Part2 流程功能相关

## 2.1 流程信息同步到数据库主表 

+ 由于轻骑兵流程表是平台自动单独生成的，所以我们在进行流程时也需要把数据同步到数据库主表中，用于在前台获取到进行展示或者进行传参时使用。

+ 后台通用方法：

  ```java
  private void setFlowInfo(BpmResponseResult bpmResponseResult, LyBzwzglDestroymaster lyBzwzglDestroymaster) {
      JSONArray jsonArray = bpmResponseResult.getResult();
      //当前节点名称
      String taskName = (String) jsonArray.getJSONObject(0).get("taskDefinitionName");
      //流程实例ID，即当前这条流程的实例ID
      String processInstanceId = (String) jsonArray.getJSONObject(0).get("processInsId");
      //任务定义KEY，即流程中对应的流程节点标识，如 hussar_2
      String taskDefinitionKey = (String) jsonArray.getJSONObject(0).get("taskDefinitionKey");
      //
      String taskId = (String) jsonArray.getJSONObject(0).get("taskId");
      //下一节点待办人
      List<String> userIdList = JSONObject.parseArray(JSONObject.toJSONString(jsonArray.getJSONObject(0).get("userId")), String.class);
      String todoIds = "";
      if (CollectionUtils.isNotEmpty(userIdList)) {
          todoIds = userIdList.stream().collect(Collectors.joining(","));
      }
  
      lyBzwzglDestroymaster.setProcessNode(taskName);
      lyBzwzglDestroymaster.setProcessInstanceId(processInstanceId);
      lyBzwzglDestroymaster.setTaskKey(taskDefinitionKey);
      lyBzwzglDestroymaster.setTaskId(taskId);
      lyBzwzglDestroymaster.setAssigneeid(todoIds);
      lyBzwzglDestroymaster.setProcessDefinitionKey(null);
      // 去除之前节点签字及日期
      this.clearPreSign(lyBzwzglDestroymaster,taskDefinitionKey);
      lyBzwzglDestroymasterService.saveOrUpdate(lyBzwzglDestroymaster);
  }
  ```



## 2.2 清除签字及签字日期

+ 驳回和撤回时需要清空之前签字和签字日期

  ```java
  private void clearPreSign( LyBzwzglDestroymaster lyBzwzglDestroymaster, String taskDefinitionKey) {
      if (lyBzwzglDestroymaster == null || StrUtil.isBlank(taskDefinitionKey)) {
          return;
      }
      // 发起节点, 清除所有签字信息
      switch (taskDefinitionKey) {
          case "hussar_2":
              // 计量人员
              lyBzwzglDestroymaster.setDestructionPerson("");
              lyBzwzglDestroymaster.setDestructionPersonId("");
              lyBzwzglDestroymaster.setDestructionPersonDate(null);
          case "hussar_4":
              // QA确认
              lyBzwzglDestroymaster.setTestLeader("");
              lyBzwzglDestroymaster.setTestLeaderId("");
              lyBzwzglDestroymaster.setTestLeaderDate(null);
      }
  }
  ```




## 2.3 BpmResponseResult

+ 后台执行完流程后的返回对象。

+ 包含

  + String code
  + String msg
  + JSONArray result

+ code为"1"表示流程变动成功

+ result为JSONArray，其中包含一个列表，列表中为一个JSONObject对象

  + 包含信息

    + taskDefinitionKey
    + taskDefinitionName
    + processInsId
    + userId（待办人）（list）
    + taskId

  + 提取信息方法

    + 提取字符串：(String) bpmResponseResult.getResult().getJSONObject(0).get("taskDefinitionName")

    + 提取（代办人）列表：

      ```java
      List<String> userIdList = JSONObject.parseArray(JSONObject.toJSONString(jsonArray.getJSONObject(0).get("userId")), String.class);
      ```

      



# Part3 Mapper查询高级

## 3.1 主子表查询

+ 第一步：创建主子表实体类

+ 第二步：主表封装resultmap

  + 尤其注意最下方子表对应的封装
    + property：指的是实体类的参数名
    + column：指主表与子表对应的字段，而且将会在下方查询子表时用到该字段
    + ofType：子表实体类
    + select：子表查询方法的id

  ```xml
  <resultMap id="baseResult" type="com.jxdinfo.hussar.example.productionmanage.productiontaskmanage.danoneexperimentalformula1.model.DanoneExperimentalFormulaWithMaterial">
      <result column="businessId" property="businessId"/>
      <result column="creatorId" property="creatorId"/>
      <result column="factoryArea" property="factoryArea"/>
      <result column="creatorUser" property="creatorUser"/>
      <result column="dataOrgan" property="dataOrgan"/>
      <result column="delFlag" property="delFlag"/>
      <result column="creatorId" property="creatorId"/>
      <result column="createTime" property="createTime"/>
      <result column="lastEditorId" property="lastEditorId"/>
      <result column="lastTime" property="lastTime"/>
      <collection property="formulaDetailsZb" column="{formulaId=businessId}" ofType="com.jxdinfo.hussar.example.productionmanage.productiontaskmanage.experimentalformuladetails1.model.ExperimentalFormulaDetails1" javaType="ArrayList" select="T3SubSelect">
      </collection>
  </resultMap>
  ```

+ 第三步：子表封装resultmap

  ```xml
  <resultMap id="T3SubResult" type="com.jxdinfo.hussar.example.productionmanage.productiontaskmanage.experimentalformuladetails1.model.ExperimentalFormulaDetails1">
      <id column="BUSINESS_ID" property="businessId"/>
      <result column="EXPERIMENTAL_FORMULA_ID" property="experimentalFormulaId"/>
      <result column="DEL_FLAG" property="delFlag"/>
      <result column="CREATOR_ID" property="creatorId"/>
      <result column="CREATE_TIME" property="createTime"/>
      <result column="LAST_EDITOR_ID" property="lastEditorId"/>
      <result column="LAST_TIME" property="lastTime"/>
  </resultMap>
  ```

+ 第四步：查询子表方法

  + 后面where的参数对应的就是上面主表封装的resultmap的column的对应字段

  ```xml
  <select id="T3SubSelect" resultMap="T3SubResult">
      SELECT
      *
      FROM danone_experimental_formula_details T3
      WHERE  T3.EXPERIMENTAL_FORMULA_ID = #{formulaId}
  </select>
  ```

+ 第五步：主子表查询方法

  + 重点在于resultMap要对应前面封装的resultmap

  ```xml
  <select id="getFormulaWithMaterial" resultMap="baseResult">
      SELECT
      t.BUSINESS_ID as businessId,
      t.TASK_ID as taskId,
      FROM danone_experimental_formula t
      <where>
          <if test="queryFormulaDataset.taskProductionId != null">
              and t.TASK_ID = #{queryFormulaDataset.taskProductionId}
          </if>
      </where>
  </select>
  ```




# Part4 Mybatis

## 4.1 配置项

+ 打印SQL语句

  + log-impl: org.apache.ibatis.logging.stdout.StdOutImpl

    ```properties
    mybatis-plus:
      type-handlers-package: com.jxdinfo.hussar.support.mp.typeconvter
      mapper-locations: classpath*:com/jxdinfo/hussar/**/mapping/*.xml
      typeAliasesPackage: com.jxdinfo.hussar.**.model,com.xxxx.**.model
      typeEnumsPackage: com.jxdinfo.hussar.common.constant.enums
      check-config-location: true
      global-config:
        banner: false
        db-config:
          id-type: assign-id
        enable-sql-runner: true
      configuration:
        map-underscore-to-camel-case: false
        cache-enabled: true
        lazyLoadingEnabled: false
        multipleResultSetsEnabled: true
        log-impl: org.apache.ibatis.logging.stdout.StdOutImpl  # 打印sql语句
    ```

    

  

