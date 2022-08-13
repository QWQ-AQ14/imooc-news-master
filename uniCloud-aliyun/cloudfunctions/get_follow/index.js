'use strict';
const db = uniCloud.database()
const $ = db.command.aggregate
exports.main = async (event, context) => {
  const {
    user_id
  } = event
  let user = await db.collection('user').doc(user_id).get()
  // 为了拿到的是对象数据而非数组数据
  user = user.data[0]
  
  const list = await db.collection('article')
      .aggregate()
      .addFields({
		  // 判断文章是否已经被收藏
        is_like: $.in(['$_id', user.article_likes_ids])
      })
      .project({
        content: 0
      })
	  // 只返回收藏过的文章
      .match({
        is_like: true
      })
      .end()
  //返回数据给客户端
  return {
    code: 200,
    msg: '数据获取成功',
    data: list.data
  }
};
