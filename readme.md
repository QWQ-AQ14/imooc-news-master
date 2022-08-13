@[TOC]( )

- 官方网站：`https://uniapp.dcloud.io/`
- UMI-APP出现问题总结：
[uni-app出现的一些踩坑注意点](https://juejin.cn/post/7020680215009427470#heading-36)
[ video标签中使用src黑屏问题 ](https://juejin.cn/post/6970878757376622629)
- 特色：
	条件编译
	App端的Nvue开发
	HTML5+
- 知识点
![在这里插入图片描述](https://img-blog.csdnimg.cn/4939c62074104cc7ba4936899b4e2276.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAQVExNF8=,size_20,color_FFFFFF,t_70,g_se,x_16)
# 环境开发
- 安装并运行`HbuiderX`
- 使用`vue-cli`的方式运行项目


```javascript
vue create -p dcloudio/uni-preset-vue test-uniapp
```
- 采用 Sass 预处理编辑器实现 css 编写
# 模板语法
问题：为什么data不建议用对象格式？
- 因为变量会一直保留，更新页面时，值不会进行初始化

注意：
- template模块下只能存在一个元素

# 工作内容
## 1 首页功能开发
### 1.1 初始化数据库
### 1.2. 配置tabbar
![在这里插入图片描述](https://img-blog.csdnimg.cn/c4305621f990481590b696e6bc87f0dd.png)
### 1.3. 自定义导航栏
	注意事项：
	- 在uni-app中存在`easyCom`，若组件的命名方式是：`components/组件名/组件名.vue`，就不需要引用和注册，直接使用即可
	- 此时是==局部引入==
	- 一般导航栏高度在44 45 左右
	- 颜色频繁使用，将其放入`uni.scss`中，即设置某个变量代替：`$mk-base-color:#f07373`
	问题：
	- 设置好后，导航栏随着滚动条消失了
### 1.4. 添加小程序的状态栏（导航栏适配小程序）
	注意事项：
	- 状态栏高度要根据手机型号调整
	- 搜索框高度也不能固定
	- 将小程序状态栏字体调成白色
```javascript
"pages": [ //pages数组中第一项表示应用启动页，参考：https://uniapp.dcloud.io/collocation/pages
		{
			"path": "pages/tabbar/index/index",
			"style": {
				//导航栏的样式 custom取消默认的导航栏
				"navigationStyle":"custom",
				//字体颜色为白色
				"navigationBarTextStyle":"white",
				"navigationBarTitleText": "uni-app"
			}
		}
```

### 1.5. 使用字体图标
- [插件市场地址](https://ext.dcloud.net.cn/)
### 1.6. 选项卡展示
 `scroll-view`可滚动视图区域，用于区域滚动
 [滚动视图](https://uniapp.dcloud.io/component/scroll-view.html#scroll-view)
### 1.7. 选项卡数据初始化
	- 新建云函数，并上线部署
	- 通过云函数获取数据
	- props传递数据
```javascript
//获取数据库的引用
const db = uniCloud.database()

```
### 1.8. 封装数据请求
- 将函数返回的错误同意管理，只是关注成功的回调
- 使用`requireApi`实现文件批量导出

```javascript
// 批量导出文件
const requireApi = require.context(
	//api 目录的相对路径
	'.',
	//是否查询子目录
	false,
	//查询文件的一个后缀
	/.js$/
)

let module = {}
requireApi.keys().forEach((key,index)=>{
	// 去掉index.js
	if(key === './index.js') return 
	Object.assign(module,requireApi(key))
})
export default module
```
### 1.9. 选项卡切换
- 选项卡点中高亮
### 1.10.基础卡片视图实现\更多卡片视图实现
- 解决滚动时导航栏同时上移的问题
![在这里插入图片描述](https://img-blog.csdnimg.cn/0e2a0b8d44dd4e4fa4b29af933ade970.png)
### 1.11. 实现内容的切换
- 使用`swiper-item`实现页面左右上下滚动，注意高度撑开
- `change`事件监听`swiper`，关注返回内容中`detail`属性
- 利用`emit`完成组件中的传值
- `swiper`中属性`current`可选择当前跳转的哪个页面

### 1.12. 内容卡片数据初始化
- 将数据动态渲染到卡片中
- 调用云数据库中的内容，建立云函数，记得上传部署

```javascript
const db = uniCloud.database()
exports.main = async (event, context) => {
	//event为客户端上传的参数
	// 获取数据
	const list = await db.collection('article')
	.field({
		//过滤掉content内容 true:表示只返回该字段 FALSE：不返回
		content:false
	})
	.get()
	
	//返回数据给客户端
	return {
		code:200,
		msg:'数据请求成功',
		data:list.data
		}
};
```
- api文件中引入
- methods创建方法`this.$api.get_list().then(res=>{})`,周期`created`调用
![在这里插入图片描述](https://img-blog.csdnimg.cn/38938b39923e47e997eaa0d3782d6f0f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAQVExNF8=,size_20,color_FFFFFF,t_70,g_se,x_16)
### 1.13. 切换选项卡懒加载数据【优化】
- 对swiper进行更改时会触发change事件
- 云函数中筛选文章分类数据，采用==聚合==的方法，更精细化的处理数据（求和、分组、筛选）

```bash
exports.main = async (event, context) => {
	//event为客户端上传的参数
	const list = await db.collection('article')
	//获取数据库集合的聚合操作实例
	.aggregate() 
	//根据条件过滤文档，并且把符合条件的文档传递给下一个流水线阶段。 
	.match({ //匹配类别为前端开发的文章
		classify:'前端开发'
	})
	//把指定的字段传递给下一个流水线，指定的字段可以是某个已经存在的字段，也可以是计算出来的新字段。 
	.project({
		//类似field 不需要接收content false 或0
		content:false
	})
	//标志聚合操作定义完成，发起实际聚合操作 
	.end()
```
- 切换不同类别的导航栏时，数据会有闪动
![在这里插入图片描述](https://img-blog.csdnimg.cn/914a24bc8066437aa04a25c4575e5c72.png)
### 1.13. 上拉加载更多【优化】
- 首页的第一个展示应该是推荐，而非分类文章
![在这里插入图片描述](https://img-blog.csdnimg.cn/87288efad21e4ec9b5cbb82fbe8bd7c0.png)
- 【优化】每次切换分类，之前分类已经加载的数据不需要再向服务器请求
	进行一个数据存在性的判断
	

```javascript
//当数据不存在或者长度是0的情况下， 才去请求数据
if(!this.listCatchData[current] || this.listCatchData[current].length === 0){
	this.getList(current)
}
```

- 标签中没有数据时，显示数据正在加载中
1. 进入插件市场
2. 使用`loadmore`插件

```javascript
//loading:正在加载
//noMore:没有更多数据
//状态需要进行判断
<uni-load-more iconType="snow" status="loading"></uni-load-more>
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/b18abbb7c0344764bfd066282f90ad6d.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/e3ec0d2ac80348f180f6454ca6ec06a2.png)![在这里插入图片描述](https://img-blog.csdnimg.cn/ab2f9fc40f27497f85116a6be0e77d69.png)

- 如何判断==没有更多数据==的显示?
1.确定每页显示的数据量`pageSize`
2.通过云函数中的聚合限制

```javascript
	//指定一个正整数，跳过对应数量的文档，输出剩下的文档
	.skip(pageSize * (page - 1))
	//指定查询结果集数量上限 
	.limit(pageSize)
```
- 实现上拉加载
	scroll-view中的触发事件`@scrolltolower=“”`：滑动到底部/右边会触发

### 1.14 收藏按钮实现【优化】【问题】
![在这里插入图片描述](https://img-blog.csdnimg.cn/45c5af584920408d95495f256c60c24b.png)- 心形图标设置

```javascript
//heart-filled：爱心填充
<uni-icons size="20" color="#f07373" type="heart"></uni-icons>
```
- 【优化】多篇文章若多次触发收藏按钮点击回调会造成整个页面的渲染，影响性能
- 单独交互最好抽离出来形成一个单独的组件
- 【问题】点击范围出现问题，若卡片同时存在点击事件点击收藏按钮会同时触发两个事件
- 在==我的==页面中反映出收藏的内容，操作云函数数据库在`user`数据表中属性`article_like_ids`

```javascript
const db = uniCloud.database();
const dbCmd = db.command;
exports.main = async (event, context) => {
  //event为客户端上传的参数
  const {
    user_id,
    article_id
  } = event;
  const userinfo = await db.collection('user').doc(user_id).get();
  const article_likes_ids = userinfo.data[0].article_likes_ids;
  
  let dbCmdFun = null;
  if (article_likes_ids.includes(article_id)) {
  		//删除
    dbCmdFun = dbCmd.pull(article_id);
  } else {
  		//添加
    dbCmdFun = dbCmd.addToSet(article_id);
  }
  await db.collection('user').doc(user_id).update({
    article_likes_ids: dbCmdFun
  })
  //返回数据给客户端
  return {
    code: 200,
    msg: '数据请求成功',
    data: userinfo.data[0]
  }
};
```
写完api文件引入

- 【问题】刷新之后页面之后，收藏的状态消失
	云函数获取列表文章信息中通过==聚合==添加一个字段
	

```javascript
//设置聚合的操作符
const $ = db.command.aggregate
//追加字段
.addField({
	//$.in() 当前某个数组是否包含某个字段
	is_like:$.in(['$_id',article_likes_ids])
})
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/283e97a641fc455e88e94b8df93f5876.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAQVExNF8=,size_20,color_FFFFFF,t_70,g_se,x_16)

- 通过`uni.showLoading、uni.hideLoading、uni.showToast`实现收藏提示语

![在这里插入图片描述](https://img-blog.csdnimg.cn/2cc55c84ecc843ef8203312de2fb6910.png)
## 2 搜索页功能模块
### 2.1 搜索页导航栏修改
![在这里插入图片描述](https://img-blog.csdnimg.cn/2413792cd0a74035ac82846ca39a3b3c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAQVExNF8=,size_17,color_FFFFFF,t_70,g_se,x_16)
- 将默认组件样式消失，在pages页面下的相关组件中写`"navigationStyle": "custom"`

### 2.2 使用Vuex管理历史记录
- 引入、注册、使用
- 【问题】每输入一个数字都要发送一次请求，需要限制请求系数
- 利用==正则==通过文章名筛选搜索的内容

```javascript
.match({
      title: new RegExp(value)
    })
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/fc1676b2109543f6ab79ceba205e66b2.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAQVExNF8=,size_16,color_FFFFFF,t_70,g_se,x_16)
- 点击相关文章，需要把历史记录保存在vuex中

### 2.3 搜索历史数据持久化【问题】
- 搜索页面中的返回首页使用`uni.switchTab`
- 【问题】由于vuex非持久化储存，所以刷新页面会导致历史记录丢失

## 3 标签页功能模块
- 点击首页的设置出现
![在这里插入图片描述](https://img-blog.csdnimg.cn/f461985992bb48b9a4a54c7d61a70779.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAQVExNF8=,size_17,color_FFFFFF,t_70,g_se,x_16)
### 3.1 标签管理页布局样式
- 点击编辑，相关标签会出现X号
`uni-icons type="clear"`

### 3.2 标签页数据处理
- 利用聚合判断是==我的标签==还是==标签推荐==
- 点击编辑实现相关操作
- 保存标签页数据
![在这里插入图片描述](https://img-blog.csdnimg.cn/3189b9488c494842b06bd656089fdb78.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAQVExNF8=,size_17,color_FFFFFF,t_70,g_se,x_16)

### 3.3 使用自定义事件同步数据
- 标签设置完成后，需要将设置的标签传递给首页
- 使用`emit`触发，`on`监听回调
- 自定义事件，只能在打开的是页面触发

## 4 详情页功能模块
### 4.1 详情页页面展示
![在这里插入图片描述](https://img-blog.csdnimg.cn/f0378caa9d0b48938d0f307125eb736e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAQVExNF8=,size_17,color_FFFFFF,t_70,g_se,x_16)

- 用户头像圆角设置50%，压缩的话用flex-shrink设置为0
- 评论工具栏高度：54px
- 编辑小图标：`type="compose"`
- 评论小图标：`type="chat"`
- 收藏小图标：`:type="formData.is_like?'heart-filled':'heart'"`
- 点赞小图标：`:type="formData.is_thumbs_up?'hand-thumbsup-filled':'hand-thumbsup'"`
- 定位：`position:fixed`

### 4.2 内容预加载【优化】
- 点进文章详情中部分相关信息已经在首页列表中获取到，可以实现预加载
- 通过`url`进行参数的传递，通过`JSON.stringify`将对象转换为字符串形式（因为URL必须传递字符串）
- 传参注意长度，url传递的长度有限制，使用什么参数就传什么参数
```javascript
// 为了点击文章详情进行的预加载
      const params = {
        _id: item._id,
        title: item.title,
        author: item.author,
        create_time: item.create_time,
        thumbs_up_count: item.thumbs_up_count,
        browse_count: item.browse_count
      }
// 点击文章跳转到文章详情页面 
      uni.navigateTo({
        url: '/pages/detail/detail?params='+JSON.stringify(params)
      })
```
- 如何获取到参数？在文章详情页面`home-detail`的生命周期`onLoad()`
- 使用`JSON.parse()`将其转换成对象形式
- 将之前页面的内容传递到之后的页面，解决数据读取中的白屏现象，实现快速渲染
```javascript
	onLoad(query) {
      this.formData = JSON.parse(query.params);
      this.getDetail();
      this.getComment();
    }
```
### 4.3 详情页面数据初始化
- 新建云函数，手动在文章数据库中增加三个字段
- `$.in([a,b])`:判断b中是否包含a字段
```javascript
// 手动添加三个字段
  let list = await db.collection('article').aggregate().addFields({
    // 是否关注作者
    is_author_like: $.in(['$author.id', userinfo.author_likes_ids]),
    // 是否收藏文章
    is_like: $.in(['$_id', userinfo.article_likes_ids]),
    // 是否点赞
    is_thumbs_up: $.in(['$_id', userinfo.thumbs_up_article_ids])
  })
```
- `match`进行筛选 现在查找的是所有的文章列表 只需要返回传入对应文章的信息

```javascript
  .match({
    _id: article_id
  })
```
- 利用`project`拒绝返回评论字段

```javascript
.project({
    comments: 0
  })
```

### 4.4 富文本渲染【插件】
- 数据库传过来的文章内容是html格式，如何处理？
![在这里插入图片描述](https://img-blog.csdnimg.cn/d84b91bad9cf4d909806eb7733c87c2a.png)
- 利用`gaoyia-parse`插件中的`uParse`实现富文本渲染`	  <uni-popup ref="popup" type="bottom" :maskClick="false">`
- 使用方法 content：富文本内容 noData：无数据时显示的内容

```javascript
<uparse :content="formData.content" :noData="noData"></uparse>
noData: '<p style="text-align:center;color:#666">详情加载中...</p>'
```
- 样式还是很丑，去`App.vue`中加载插件中的样式

```javascript
/*每个页面公共css */
  @import url("/components/gaoyia-parse/parse.css");
```
- 也可以使用官方提供的`<rich-text>`解析富文本，缺点是代码构建会复杂

### 4.5 发布窗口展示【插件】
- 点击评论输入弹出输入框
- 使用`uni-popup`插件实现评论弹出框，该插件依赖`uni-transition`组件

```javascript
		//ref:弹出框 type:底部弹出 maskClick:点击蒙版是否取消弹窗
	  <uni-popup ref="popup" type="bottom" :maskClick="false">
```

- 样式设置左右对齐：`display: flex;justify-content: space-between;`
- 右对齐：`justify-content:flex-end `

### 4.6 评论内容实现【知识】
- 设置云函数评论的接收参数

```javascript
// 查询条件声明符
const dbCmd = db.command
  const {
    user_id, // 用户id
    article_id, // 文章id
    content, // 评论内容
    comment_id = '', // 评论id
    reply_id = "", // 子回复ID
    is_reply = false // 是否子回复
  } = event
```
- 获取文章下的所有评论

```javascript
let commentObj = {
		comment_id: getID(5), //评论ID
		comment_content: content, // 评论内容
		create_time: new Date().getTime(), // 创建时间
		is_reply: is_reply, // 区分主回复，还是子回复 
		author: {
			author_id: user._id, // 作者id
			author_name: user.author_name, // 作者名称
			avatar: user.avatar, // 作者头像
			professional: user.professional // 专业 前端工程师还是后端
		},
		reply: [],
	}
```
获取时间戳的原因在于：云函数中处理的时间与实际时间有差距
- 随机生成评论ID

```javascript
function getID(length) {
	return Number(Math.random().toString().substr(3, length) + Date.now()).toString(36)
}
```
方法 `num.toString(base)` 返回在给定 base 进制数字系统中 num 的字符串表示形式
![在这里插入图片描述](https://img-blog.csdnimg.cn/77acf40625ea43b0a5927b4212b734b5.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAQVExNF8=,size_20,color_FFFFFF,t_70,g_se,x_16)

- 更新文章评论

```javascript
await db.collection('article').doc(article_id).update({
		comments: commentObj
	})
```
- 设置好评论布局，调用接口
- 设置得到评论函数，利用聚合中的`.unwind()`筛选数据，请求评论内容

```javascript
const list = await db.collection('article').aggregate().match({
      _id: article_id
    })
    .unwind('$comments')
    .project({
      _id: 0,
      comments: 1
    })
    .replaceRoot({
      newRoot: '$comments'
    })
    .skip(pageSize*(page-1))
    .limit(pageSize)
    .end()
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/b0207d495d9d494daf07b020264253eb.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAQVExNF8=,size_20,color_FFFFFF,t_70,g_se,x_16)![在这里插入图片描述](https://img-blog.csdnimg.cn/0da6d154e6034734aa53a5ea32741947.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAQVExNF8=,size_20,color_FFFFFF,t_70,g_se,x_16)

- 实现回复内容模块
- 由于回复模块相似 ，可以使用==递归引用==，注意name值的书写
- 会出现无线调用的问题，需要条件限制

```javascript
 <view class="comments-reply" v-for="item in comments.reply" :key="item.comment_id">
        <comments-box :comments="item" :replys="true" @reply="reply"></comments-box>
      </view>
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/c6785b2467a84621b6ffed39a38731d6.png)

![在这里插入图片描述](https://img-blog.csdnimg.cn/d5e758d3b5624c6386cc638286bd3631.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAQVExNF8=,size_15,color_FFFFFF,t_70,g_se,x_16)

- 通过设置一个属性区分回复的地方

```javascript
	replys: {
      type: Boolean,
      default: false
    }
```

### 4.7 关注作者按钮 
- 云函数中利用`dbCmd.pull()`和`dbCmd.addToSet()`实现取消关注和添加关注

```javascript
  let dbCmdFun = null;
  if(author_likes_ids.includes(author_id)) {
	  // 取消关注
    dbCmdFun = dbCmd.pull(author_id)
  } else {
	  // 添加关注
    dbCmdFun = dbCmd.addToSet(author_id)
  }
  
  await db.collection('user').doc(user_id).update({
    author_likes_ids: dbCmdFun
  })
```
### 4.7 文章的收藏和点赞
- 点赞不能取消
- 云函数执行失败如何查看错误？
打开web控制台=》找对应云函数=》点开日志
-首页收藏需要更新`uni.emit()`

### 4.8 评论列表【正则】
- 点击评论按钮显示评论列表
- 限制文章详情中显示的评论数量
- 页面上拉加载，用生命周期`onReachBottom()`

```javascript
onReachBottom() {
			//下拉没数据 不进行数据请求
			if (this.loading === 'noMore') return;
			this.page++;
			this.getComment();
		},
// 对象复制
		let oldList = JSON.parse(JSON.stringify(this.commentList));
		oldList.push(...data);
		this.commentList = oldList;
```
- 创建的时间戳转换为正常的时间显示
- 创建`utils`文件里面存放一些工具类
- 利用==正则==匹配时间戳并格式化
- 计算属性`filters`使用
```javascript
export const  parceTime = (time) => {
  const format = '{year}-{month}-{day} {hour}:{minute}:{second}'
  let date = null;
  if (typeof date === 'string') {
    time = parseInt(date)
  }
  date = new Date(time)
  const formatObj = {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds()
  }
  let strTime = format.replace(/{(year|month|day|hour|minute|second)+}/g, (res, key) => {
    let val = formatObj[key];
    if (res.length > 0 && val < 10) {
      val = '0' + val;
    }
    return val;
  })
  return strTime;
}
//引入
import {parceTime } from '@/utils/index.js'
//使用
filters: {
    dateFormat(time) {
      return parceTime(time);
    }
  },
```

## 5 关注页功能模块
### 5.1 关注导航栏实现
![在这里插入图片描述](https://img-blog.csdnimg.cn/5626e74b7e9f4c0c81b2cdd8a9b8ac5f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAQVExNF8=,size_15,color_FFFFFF,t_70,g_se,x_16)- Sass实现中间竖线，通过伪元素

```javascript
.tab-item:nth-child(1) {
          border-right: 1px solid $theme-color;
        }
```
### 5.2 收藏文章内容实现
- 用`swiper`实现文章和作者的左右滑动效果，高度要设置100%，不然滚动不了
- 设置云函数`get_follow`，同样通过聚合筛选，获取收藏的文章列表数据
- 取消收藏相应页面消失
- 添加加载消息提示
- 收藏数据状态变更反应到首页，使用自定义事件
- 【问题】每次点击首页中的文章收藏，list组件都会触发监听事件，影响使用效果，需要在该组件中国添加一个类别判断属性，只有来自follw组件才触发

### 5.3 关注作者页面实现
 ![在这里插入图片描述](https://img-blog.csdnimg.cn/dde74802e6f04c3a84cbf6f0c33a447a.png)
- 同样使用自定义事件进行状态的更新
## 6 个人信息页功能模块
### 6.1 个人中心页面实现
![在这里插入图片描述](https://img-blog.csdnimg.cn/af5a7cc62f644922ad0476e440a37c6b.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAQVExNF8=,size_16,color_FFFFFF,t_70,g_se,x_16)
- 背景虚化`filter`

```javascript
.header-background {
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			opacity: 0.3;
			filter: blur(8px);

			image {
				width: 100%;
				height: 100%;
			}
		}
```
- 头像图标`contact`

```javascript
<uni-icons class="icons" type="contact" size="16" color="#666"></uni-icons>
```
- 问号图标`help`

```javascript
<uni-icons class="icons" type="help" size="16" color="#666"></uni-icons>
```
### 6.2 个人中心数据处理
- 通过`vuex`保存用户的相关信息，并本地存储
### 6.3我的文章的实现
- 新建页面
### 6.4问题反馈页面实现
- 点击加号选择图片使用`uni.chooseImage()`,this的指向不是vue的实例，里面的回调要使用箭头函数
- 选完图片隐藏
- 图片上传 `uniCloud.uploadFile()`
	1. 打开web控制台
	2. 打开云存储（图片上传的位置）
	3. 图片循环上传（API 只支持单张图片上传）
```javascript
async submit(){
	let imagesPath = []
	uni.showLoading()
	for(let i = 0;i < this.imgLists.length;i++){
		const filePath = this.imgLists[i]
		filePath = await this.upoadFiles(filePath)
		imagesPath.push(filePath)
	}
	uni.hideLoading()
}
async upoadFiles(filePath){
	consr result = await uniCloud.uploadFile({
		filePath:filePath
	})
	return result.fileID
}
```
	4. 点击云存储可以看到上传好的反馈图片
- 新建数据库保存反馈意见
- 反馈提交成功后，跳转到个人中心（加个定时器）

# 平台兼容
## 微信小程序优化与兼容
### 问题1：`loadmore`加载到文章列表的上面
![在这里插入图片描述](https://img-blog.csdnimg.cn/7b89c0c64b714359aa8c82093f15bd82.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAQVExNF8=,size_20,color_FFFFFF,t_70,g_se,x_16)- 原因：由于list-card渲染完全的时间比loadmore慢
- 解决：套一个空的元素

```javascript
<view class=""> 
	  <!-- 为了兼容小程序 包一个外壳 -->
	  	<list-card :item="item" v-for="item in list" :key="item._id"></list-card>
	  </view>
```
### 问题2：翻页的时候显示没有数据
![在这里插入图片描述](https://img-blog.csdnimg.cn/59712e638bb748f797777f83d4453657.png)- 原因：`load.loading`为`undefined`，由于第一次初始渲染的时候load未定义
- 解决：

```javascript
:status="load.loading || 'loading'" 
```
### 问题3：微信开发小程序清除所有缓存后重编译报错
- 报错信息：`请求云函数错误：docId必须为字符串或数字`
- 原因：ID信息不同步
- 解决：`通过watch监听vuex中userinfo状态的变化，状态变更在请求接口`
# 遇到的问题
## 1. 设置好导航栏后，会随着滚动条的移动而消失
- 需要给标签设置好定位
- 滚动内容需要单独封装组件，使用匿名插槽
- 将卡片单独封装成组件
- 标题文件溢出隐藏
```css
position：fixed
left:0
top:0
z-index:99
```
- 设置完后数据显示仍然有些问题

```javascript
<view class="navbar-fixed">
				<view class="navbar-search-icon">
					
				</view>
				<view class="navbar-search-text">
					uni-app
				</view>
				<view style="height: 45px;"></view>
</view>
```





##  2. 小程序的状态栏高度要根据手机型号调整
在created（）生命周期中使用：
	

```javascript
created() {
			// /获取手机系统信息
			const info= uni.getSystemInfoSync()
			console.log(info)
			// 设置状态栏的高度
			this.statusBarHeight = info.statusBarHeight
		}
```
	
##  3. 搜索框高度也不能固定
通过API接口获取小程序胶囊的位置，然后计算高度
同时将宽度也调整好
![在这里插入图片描述](https://img-blog.csdnimg.cn/732c2073531c471a8d8f3317d32c0c12.png)

```javascript
			// 获取胶囊的位置
			const MenuButtonInfo = uni.getMenuButtonBoundingClientRect()
			// (胶囊底部高度- 状态栏的高度) +. (胶囊顶部高度-.状态栏内的高度)
			// =导航栏的高度
			this.navBarHeight = (MenuButtonInfo.bottom - info.statusBarHeight) + (MenuButtonInfo.top - info
				.statusBarHeight)
			this.windowWidth = MenuButtonInfo.left;
```
==注意==:接口`getMenuButtonBoundingClientRect`在H5、app、mp-alipay不支持
==解决：==利用ifndef

```javascript
#ifndef H5 || APP-PLUS || MP-ALIPAY
			// 获取胶囊的位置 h5不支持
			const MenuButtonInfo = uni.getMenuButtonBoundingClientRect()
			// (胶囊底部高度- 状态栏的高度) +. (胶囊顶部高度-.状态栏内的高度)
			// =导航栏的高度
			this.navBarHeight = (MenuButtonInfo.bottom - info.statusBarHeight) + (MenuButtonInfo.top - info
				.statusBarHeight)
			this.windowWidth = MenuButtonInfo.left;
#endif
```

## 4.tab页面设置内容滚动时，导航栏同时上移消失 
## 5.切换不同类别的导航栏时，相应变更的数据会有闪动（懒加载）
- 在显示文章列表的组件中，切换时每次会给list赋一个新值，但赋值之前仍然为旧值，所以在通过云函数赋新值的过程中，仍然可以看到旧值
- 解决：设置一个缓存变量
- 利用`this.$set(this.listCatchData, current, data)`监听数组变化

## 6.点击范围出现问题，若卡片同时存在点击事件点击收藏按钮会同时触发两个事件
![在这里插入图片描述](https://img-blog.csdnimg.cn/406e8bb678ad4857b74ecab780b9b32d.png)

- 收藏按钮需要==阻止冒泡==
- 在收藏按钮点击事中加修饰符

```javascript
@click.stop="likeTap"
```

## 7. 搜索框中的内容每输入一个字符都要发送一次请求，需要限制请求次数
- 不管用户输入多么频繁，每一秒才发送一次请求

```javascript
				if (!this.mark) {
					this.mark = true;
					this.timer = setTimeout(() => {
						this.mark = false
						this.getSearch(value)
					}, 1000)
				}
```

## 8.由于vuex非持久化储存，所以刷新页面会导致历史记录丢失
- 利用本地缓存
- vuex数据初始化先查看本地缓存是否存在相关数据
```javascript
//state
historyList: uni.getStorageSync('_history') || [] 
//action 将数据保存在本地
uni.setStorageSync('_history', list)
//清除本地缓存
uni.removeStorageSync('_history')
```

# 慕课新闻APP项目知识总结：
## 1.数据库使用
- 使用了慕课的接口
- 使用阿里云作为云服务数据库，点击database初始化`db_init.json`
![在这里插入图片描述](https://img-blog.csdnimg.cn/b63394b4b3754ccb9013a6f2240fb440.png)
## 2.事件冒泡
## 3.数据库添加删除内容
[数据库操作符](https://uniapp.dcloud.io/uniCloud/cf-database-dbcmd.html#dbcmd-update-array)

## 4.字符串方法
- 在生成随机评论ID时使用`str.substr()`方法
JavaScript 中有三种获取字符串的方法：`substring、substr` 和 `slice`
`str.slice(start [, end])`：返回字符串从 start 到（但不包括）end 的部分。
`str.substring(start [, end])`：返回字符串在 start 和 end 之间 的部分，允许 ==start 大于 end==
`str.substr(start [, length])`：返回字符串从 start 开始的给定 length 的部分

## 5. 深入学习
![在这里插入图片描述](https://img-blog.csdnimg.cn/4ff25d5b315046b89a2b055d5303ec31.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAQVExNF8=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 项目发行打包
## H5
- manifest.json文件 -> uni-app应用标识 -> H5配置 -> 选择路由模式（线上history）-> 其他配置默认 -> 点击发行 -> 成功查看（dist文件）

# 微信小程序
![在这里插入图片描述](https://img-blog.csdnimg.cn/8da0a8a56e28425c89236cec70e36cce.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAQVExNF8=,size_20,color_FFFFFF,t_70,g_se,x_16)
域名报错，将报错的域名添加到服务器配置中（详情的项目配置唱查看）
![在这里插入图片描述](https://img-blog.csdnimg.cn/427d0fd9b9a04cf5ac133aaa8d13c561.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAQVExNF8=,size_20,color_FFFFFF,t_70,g_se,x_16)
