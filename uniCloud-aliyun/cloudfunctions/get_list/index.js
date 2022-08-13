'use strict';
const db = uniCloud.database();
// 定义聚合的操作符
const $ = db.command.aggregate;
exports.main = async (event, context) => {
  const {
    user_id,
    name,
    page = 1,
    pageSize = 5
  } = event;
  let matchObj = {};
  if (name !== '全部') {
    matchObj = {
      classify: name
    }
  }
  let article_likes_ids = []
  const userinfo = await db.collection('user').field({
    "article_likes_ids": true
  }).get();
  // 请求云函数错误: Cannot read property 'article_likes_ids' of undefined
  const like_id = userinfo.data[0].article_likes_ids;
  //console.log(userinfo.data[0].article_likes_ids);

  // 使用聚合
  // 聚合 ： 更精细化的去处理数据 求和 、分组、指定那些字段
  const list = await db.collection('article')
    .aggregate()
    // 追加字段
    .addFields({
      //  给定一个值和一个数组，如果值在数组中则返回 true，否则返回 false
      is_like: $.in(['$_id', like_id])
    })
    .match(matchObj)
    .project({
      content: 0
    })
    //  分页加载
    .skip(pageSize * (page - 1))
    .limit(pageSize)
    .end()
  //event为客户端上传的参数
  // const list = await db.collection('article').field({
  //   // true 返回这个字段的， false 表示不返回
  //   content: false
  // }).get();
  //返回数据给客户端
  return {
    code: 200,
    msg: '数据请求成功',
    data: list.data
  }
};
