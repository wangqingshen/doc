/**
 * shifenkafei common.js
 * @author wangxiaoyuan
 * @date 2015.04.30 16:44
 */

var apiUrl = '../webservice.php';

var tagSelectedData = []; //存放被选中的查询标签的数据结构

var tagData ; //最终筛选所需的数据

var tagList = {
	'美术风格': 'artStyle',
	'题材类型': 'topics',
	'2D/3D': 'in2Or3D',
	'游戏类型': 'gameType',
	'游戏平台': 'gamePlatforms',
	'上线平台': 'onlinePlatforms',
	'游戏种类': 'gameClass',
	'当前进度': 'nstage',
	'合作方式': 'cooperation',
	'外包需求': 'outSource',
	'发行区域': 'responsible'
}

/**
 * 点击导航栏时触发事件
 * @return {String} ymdhis
 * @author 王小圆
 * @private
 */
function clickNavEvent() {
	$('#top-nav').find('ul').children('li').each(function(){
		$(this).bind('click', function(){
			$('#top-nav').find('ul').children('li').removeClass('active');
			$(this).addClass('active');
		});
	});
}

/**
 * 检测输入的数值是否为数字
 * @param {mixed} [n] 被检测的对象
 * @return {Boolean} ture|false
 * @author 王小圆
 */
function checkIsNumber(n){
	var reg = new RegExp("^[0-9]*[1-9][0-9]*$"),//正则正整数
		reg1 = new RegExp("^(([0-9]+\\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\\.[0-9]+)|([0-9]*[1-9][0-9]*))$");//正则正浮点数
	if (reg.test(n)||reg1.test(n)) {
		return true;
	} else {
		return false;
	}
}

/**
 * 获取当前时间格式为ymdhis的时间字符串
 * @return {String} ymdhis
 * @author 王小圆
 * @private
 */

function getCurTime() {
	var date = new Date(),
		y = date.getFullYear().toString().substr(2),
		m = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1).toString(),
		d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate().toString(),
		h = date.getHours() % 12 < 10 ? '0' + date.getHours() % 12 : (date.getHours() % 12).toString(),
		i = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes().toString(),
		s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds().toString();
	return (y + m + d + h + i + s);
}

/**
 * 随机生成一个n位的随机数
 * @param [Int] [n] 一个正整数
 * @return {String} [str] 生成的随机数
 * @author 王小圆
 * @private
 */

function getRandStr(n) {
	var str = '';
	for (var i = 0; i < n; i++) {
		str += Math.floor(Math.random() * 10).toString();
	}
	return str;
}

/**
 * 自动组合api接口所需的信息
 * @param {String} [apiName] api接口的方法名
 * @param {Object} [data] 传给api的data对象
 * @return {Object} [info] 组合以后的info对象
 * @author 王小圆
 * @private
 */

function mergeInfo(apiName, data) {
	var pid = '100',
		randStr = getRandStr(5),
		date = getCurTime(),
		timestamp = new Date().getTime(),
		sid = date + randStr,
		signature = hex_sha1(pid + randStr + date),
		info = {
			"cmd": {
				"name": apiName
			},
			"data": data,
			"header": {
				"timestamp": timestamp,
				"sid": sid,
				"signature": signature
			}
		};
	return info;
}

/**
 * 获取对应id的项目图片，包括logo
 * @param {Int} [id] 项目id
 * @param {Object} [dom] 需要处理的对象
 * @author 王小圆
 * @private
 */

function getProductImage(id, dom) {
	var data = {
		'pId': id
	},
		info = mergeInfo('productImages', data);
	$.ajax({
		type: 'POST',
		url: apiUrl,
		data: JSON.stringify(info),
		dataType: 'json',
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': info.length
		},
		success: function(data) {
			var $_logo = $('<img />');
			$_logo.attr('src', data.data['logo']);
			dom.append($_logo);
		}
	})
}

/**
 * 分页调用跳转方法
 * @param {Int} [target] 页码
 * @author 王小圆
 */

function gotopage(target) {
	$('.pagination').children().remove();
	ProductList.productList(target)
}

/**
 * 动态存储选中的标签名到tagSelectedData数据结构中
 * @param {String} [name] 标签类名
 * @param {String} [cfgId] 小标签序号
 * @author 王小圆
 */
function storageTagData(name, cfgId) {
	if (tagSelectedData.length) {
		var status = false;
		for (var i in tagSelectedData) {
			if (tagSelectedData[i].name === name) {
				status = true;
				tagSelectedData[i].list.push(cfgId);
			}
		}
		if (!status) {
			var a = {};
			tagSelectedData.push(a);
			a.name = name;
			a.list = [];
			a.list.push(cfgId);
		}
	} else {
		var a = {};
		tagSelectedData.push(a);
		a.name = name;
		a.list = [];
		a.list.push(cfgId);
	}
}

var ProductList = (function($) {
	var module = {
		pageSize: 30, //每页显示条数
		numSize: 5, //页码显示数 
		cpage: 1, //首页
		totalPage: 3, //总页数

		/**
		 * 项目页初始化方法
		 * @author 王小圆
		 * @public
		 */
		init: function() {
			module.getProductList(module.cpage);
			module.getLabelList('GAMECLASS', '游戏种类');
			module.getLabelList('GAMETYPE', '游戏类型');
			module.moreBtnClickEve();
			module.filterBtnEvent();
			module.resetBtnEvent();
		},

		/**
		 * 筛选按钮点击时触发事件
		 * @author 王小圆
		 * @public
		 */
		filterBtnEvent: function() {
			$("#filterBtn").bind('click', function() {
				tagData = {};
				if (tagSelectedData.length) {
					for (var i in tagSelectedData) {
						for (var j in tagList) {
							if (tagSelectedData[i].name === j) {
								tagData[tagList[j]] = tagSelectedData[i].list;
							}
						}
					}
				}
				// module.getProductList(module.cpage);
			});
		},

		/**
		 * 清除按钮点击时触发事件
		 * @author 王小圆
		 * @public
		 */
		resetBtnEvent: function() {
			$("#resetBtn").bind('click', function(){
				tagData = {};
				if(tagSelectedData.length) {
					tagSelectedData = [];
					$('#selected').hide();
					$('#selected').find('ul').children('li').remove();
					$('#filterList').find('ul').children('li').removeClass('class1');
					$('#filterList').find('ul').children('li').children('.close').remove();
				}
				//module.getProductList(module.cpage);
			});
		},

		/**
		 * 动态移除tagSelectedData数据结构中的数据项
		 * @param {String} [name] 标签类名
 		 * @param {String} [cfgId] 小标签序号
		 * @author 王小圆
		 * @public
		 */
		removeTagSelectedData: function(name, cfgId) {
			for (var i in tagSelectedData) {
				if (tagSelectedData[i].name === name) {
					for (var j in tagSelectedData[i].list) {
						if (tagSelectedData[i].list[j] === cfgId) {
							tagSelectedData[i].list.splice(j, 1);
							if (!tagSelectedData[i].list.length) {
								tagSelectedData.splice(i, 1);
							}
						}
					}
				}
			}
		},

		/**
		 * 动态移除标签选中区域中的标签
		 * @param {String} [name] 标签类名
 		 * @param {String} [cfgName] 小标签名
		 * @author 王小圆
		 * @public
		 */
		removeTagSelectedDom: function(name, cfgName) {
			var selectedDom = $('#selected').children('.selectedList').children('ul');
			selectedDom.children('li').each(function() {
				if ($(this).children('div').children('div').children(':first').html() === name + ':') {
					var tthis = $(this);
					$(this).children('div').children('div').children('span').each(function() {
						if ($(this).html() === ',' + cfgName || $(this).html() === cfgName) {
							$(this).remove();
							var len = tthis.children('div').children('div').children('span').length;
							if (len === 1) {
								tthis.remove();
							}
						}
					});
				}
			});
			if (!selectedDom.children('li').length) {
				$('#selected').css('display', 'none');
			}

		},

		/**
		 * 动态追加所选中的配置项
		 * @param {Object} [dom] 选中的配置项对象
		 * @author 王小圆
		 * @public
		 */
		addSelectDom: function(dom) {
			var _labelName = dom.parent('ul').attr('data-label'),
				_close = $('<span class="close"/>'),
				cfgId = dom.children(':first').eq(0).attr('data-cfgid'),
				cfgName = dom.children(':first').eq(0).html(),
				selectedDom = $('#selected').children('.selectedList').children('ul'),
				selectedLen = selectedDom.children('li').length;
			dom.addClass('class1');
			dom.children('span').css({
				'margin-left': '5px'
			});
			_close.html('X');
			dom.append(_close);
			$('#selected').css('display', 'block');
			if(selectedLen) {
				var state = false;
				selectedDom.children('li').each(function(){
					if($(this).children('div').children('div').children(':first').html() === _labelName+':') {
						var _lab = $('<span />').html(','+cfgName)
							.css({
								'color': '#ff8400',
								'margin-left': '3px'
							});
						$(this).children('div').children('div').append(_lab);
						state = true;
					}
				});
				if (!state) {
					var _l = $('<li class="cursor"/>'),
						_hideDiv = $('<div class="clear"/>').css('width', '300px'),
						_left = $('<div />').css({
							'float': 'left',
							'width': '155px',
							'overflow': 'hidden'
						}),
						_right = $('<span />').css({
							'display': 'block',
							'float': 'left',
							'margin-left': '5px',
							'color': '#ff8400'
						}).html('X'),
						_t = $('<span />').html(_labelName + ':')
							.css('margin-left', '5px'),
						_lab = $('<span />').html(cfgName)
							.css({
								'color': '#ff8400',
								'margin-left': '3px'
							});
					_l.append(_hideDiv);
					_hideDiv.append(_left).append(_right);
					_left.append(_t).append(_lab);
					selectedDom.append(_l);
				}
			}else{
				var _l = $('<li class="cursor"/>'),
					_hideDiv = $('<div class="clear"/>').css('width', '300px'),
					_left = $('<div />').css({
						'float': 'left',
						'width': '155px',
						'overflow': 'hidden'
					}),
					_right = $('<span />').css({
						'display': 'block',
						'float': 'left',
						'margin-left': '5px',
						'color': '#ff8400'
					}).html('X'),
					_t = $('<span />').html(_labelName + ':')
						.css('margin-left', '5px'),
					_lab = $('<span />').html(cfgName)
						.css({
							'color': '#ff8400',
							'margin-left': '3px'
						});
				_l.append(_hideDiv);
				_hideDiv.append(_left).append(_right);
				_left.append(_t).append(_lab);
				selectedDom.append(_l);
			}
			storageTagData(_labelName, cfgId);
		},

		/**
		 * 获取指定的配置项信息
		 * @param {String} [method] 配置类名
		 * @author 王小圆
		 * @public
		 */
		getLabelList: function(method, name) {
			var data = {
				'method': method
			},
				info = mergeInfo('getLabel', data);
			$.ajax({
				type: 'POST',
				url: apiUrl,
				data: JSON.stringify(info),
				dataType: 'json',
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': info.length
				},
				success: function(data) {
					var _row = $('<div class="row clear" />'),
						_cell = $('<div class="cell" />'),
						_label = $('<div class="label" />'),
						_all = $('<li />'),
						_span1 = $('<span />'),
						_ul = $('<ul />')
							.css('overflow', 'hidden')
							.attr('data-label', name),
						list = data.data;
					_cell.html(name + '：');
					_span1.html('All');
					_all.append(_span1);
					_ul.append(_all);
					_label.append(_ul);
					_row.append(_cell).append(_label);
					for (var i in list) {
						var _li = $('<li />'),
							_span = $('<span />');
						_span.attr('data-cfgId', list[i].cfgId)
							.html(list[i].name);
						_li.append(_span)
							.bind('click', function(evt) {
							var state = false,
								tthis = $(this),
								cfgId = tthis.children(':first').eq(0).attr('data-cfgid'),
								cfgName = tthis.children(':first').eq(0).html();
								tthis.children('span').each(function() {
									if ($(this).attr('class') === 'close') {
										state = true;
										tthis.removeClass('class1');
										$(this).remove();
										module.removeTagSelectedData(name, cfgId);
										module.removeTagSelectedDom(name, cfgName);
									}
								});
								if (!state) {
									module.addSelectDom($(this));
								}
							});
						_ul.append(_li);
					}
					$('#filterList').append(_row);
				}
			});
		},

		/**
		 * 项目页分页显示数据
		 * @param {Int} [target] 当前显示页码
		 * @author 王小圆
		 * @public
		 */
		getProductList: function(target) {
			if (tagData) {
				var data = tagData;
				data.page = target;
				data.pageSize = module.pageSize;
			} else {
				var data = {
					'page': target,
					'pageSize': module.pageSize
				};
			}
			var info = mergeInfo('productList', data);
			$.ajax({
				type: 'POST',
				url: apiUrl,
				data: JSON.stringify(info),
				dataType: 'json',
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': info.length
				},
				success: function(data) {
					$('.product-list').children().remove(); //清除之前数据
					var count = data.data['count'];
					module.totalPage = Math.ceil(parseInt(count) / module.pageSize);
					var list = data.data['list'];
					for (var i in list) {
						var oneProduct = $('<div class="one-product" />'),
							_a = $('<a />').attr('href', './ProductDetail.php?id=' + list[i].pId),
							_ul1 = $('<ul />'),
							_ul2 = $('<ul />'),
							_li1 = $('<li class="product-name"/>').html(list[i].pName),
							str = '使用' + list[i].engine[0] + '引擎的' + list[i].game2D3D[0] + list[i].artStyle[0] + '风格的' + list[i].gameType[0] + list[i].gamePlatforms[0] + list[i].gameClass[0],
							_li2 = $('<li class="product-des"/>').html(str),
							_li3 = $('<li class="product-img"/>'),
							_li4 = $('<li class="product-attr"/>'),
							_li41 = $('<li />'),
							_li42 = $('<li />'),
							_li43 = $('<li />'),
							_li44 = $('<li />'),
							_p1 = $('<p class="game-icon" />'),
							_p2 = $('<p class="plag-icon" />'),
							_p3 = $('<p class="area-icon" />'),
							_p4 = $('<p class="progress-icon"/>'),
							_span1 = $('<span />').html(list[i].gameClass),
							_span2 = $('<span />').html(list[i].onlinePlatforms[0]),
							_span3 = $('<span />').html(list[i].cCity),
							_span4 = $('<span />').html(list[i].stage);
						getProductImage(list[i].pId, _li3);
						_li41.append(_p1).append(_span1);
						_li42.append(_p2).append(_span2);
						_li43.append(_p3).append(_span3);
						_li44.append(_p4).append(_span4);
						_ul2.append(_li41).append(_li42).append(_li43).append(_li44);
						_li4.append(_ul2);
						_ul1.append(_li1).append(_li2).append(_li3).append(_li4);
						oneProduct.append(_ul1);
						_a.append(oneProduct);
						$('.product-list').append(_a);
					}
					var pagination = module.setPaginationList(target);
					var $_span1 = $('<span />').html('共' + module.totalPage + '页').css({
						'color': '#000',
						'font-size': '21px',
						'margin-left': '10px',
						'margin-right': '30px'
					});
					var $_span2 = $('<span>到第<input type="text" id="input"/>页</span>').css({
						'color': '#000',
						'font-size': '21px'
					});

					var _btn = $('<span class="cursor"/>').html('确认')
						.css({
							'margin-left': '10px',
							'font-size': '21px',
							'color': ' #fff',
							'border-radius': '5px',
							'padding': '5px 16px',
							'background-color': 'rgb(255, 173, 0)',
							'border': '1px solid rgb(255, 173, 0)'
						})
						.bind('click', function() {
							var index = $('#input').val();
							if(checkIsNumber(index)) {
								if(index > module.totalPage) {
									gotopage(module.totalPage);
								}else {
									gotopage(index);
								}
							}else{
								$('#input').val('');
							}
						});
					$('.pagination').append(pagination).append($_span1).append($_span2).append(_btn);
				}
			})
		},

		/**
		 * 分页实现
		 * @param {Int} [totalpage] 总页数
		 * @param {Int} [pagesize] 每页显示条数
		 * @param {Int} [cpage] 当前页数
		 * @param {Object} [dom] 处理对象
		 * @author 王小圆
		 */
		setPaginationList: function(cpage) {
			var totalpage = module.totalPage,
				pagesize = module.numSize;
			var outstr = $('<span />');
			if (totalpage <= pagesize) { //总页数小于十页 
				for (count = 1; count <= totalpage; count++) {
					if (count != cpage) {
						var _dom = $('<a onclick="gotopage(' + count + ')"/>');
						_dom.attr('href', 'javascript:void(0)')
							.html(count);
					} else {
						var _dom = $('<span />');
						_dom.attr('class', 'current')
							.html(count);
					}
					outstr.append(_dom);
				}
			}
			if (totalpage > pagesize) { //总页数大于十页 
				if (parseInt((cpage - 1) / pagesize) == 0) {
					for (count = 1; count <= pagesize; count++) {
						if (count != cpage) {
							var _dom = $('<a onclick="gotopage(' + count + ')"/>');
							_dom.attr('href', 'javascript:void(0)')
								.html(count);
						} else {
							var _dom = $('<span />');
							_dom.attr('class', 'current')
								.html(count);
						}
						outstr.append(_dom);
					}
					var _next = $('<a onclick="gotopage(' + count + ')"/>');
					_next.attr('href', 'javascript:void(0)')
						.html('下一页');
					outstr.append(_next);
				} else if (parseInt((cpage - 1) / pagesize) == parseInt(totalpage / pagesize)) {
					var _pre = $('<a onclick="gotopage(' + (parseInt((cpage - 1) / pagesize) * pagesize) + ')"/>');
					_pre.attr('href', 'javascript:void(0)')
						.html('上一页');
					outstr.append(_pre);
					for (count = parseInt(totalpage / pagesize) * pagesize + 1; count <= totalpage; count++) {
						if (count != cpage) {
							var _dom = $('<a onclick="gotopage(' + count + ')"/>');
							_dom.attr('href', 'javascript:void(0)')
								.html(count);
						} else {
							var _dom = $('<span />');
							_dom.attr('class', 'current')
								.html(count);
						}
						outstr.append(_dom);
					}
				} else {
					var _pre = $('<a onclick="gotopage(' + (parseInt((cpage - 1) / pagesize) * pagesize) + ')"/>');
					_pre.attr('href', 'javascript:void(0)')
						.html('上一页');
					outstr.append(_pre);
					for (count = parseInt((cpage - 1) / pagesize) * pagesize + 1; count <= parseInt((cpage - 1) / pagesize) * pagesize + pagesize; count++) {
						if (count != cpage) {
							var _dom = $('<a onclick="gotopage(' + count + ')"/>');
							_dom.attr('href', 'javascript:void(0)')
								.html(count);
						} else {
							var _dom = $('<span />');
							_dom.attr('class', 'current')
								.html(count);
						}
						outstr.append(_dom);
					}
					var _next = $('<a onclick="gotopage(' + count + ')"/>');
					_next.attr('href', 'javascript:void(0)')
						.html('下一页');
					outstr.append(_next);
				}
			}
			return outstr;
		},

		/**
		 * 显示更多点击事件
		 * @author 王小圆
		 * @public
		 */
		moreBtnClickEve: function() {
			$('#more').bind('click', function() {
				var t = $(this).children('.ud-text').html();
				if (t === '更多') {
					if($('#filterList').children('.row').length > 2) {
						$('#filterList').children('.row').css('display', 'block');
					}else{
						module.getLabelList('ARTSTYLE', '美术风格');
						module.getLabelList('TOPICS', '题材类型');
						module.getLabelList('2D3D', '2D/3D');
						module.getLabelList('GAMEPLATFORMS', '游戏平台');
						module.getLabelList('ONLINEPLATFORMS', '上线平台');
						module.getLabelList('NSTAGE', '当前进度');
						module.getLabelList('COOPERATION', '合作方式');
						module.getLabelList('OUTSOURCE', '外包需求');
						module.getLabelList('AREA', '发行区域');
					}
					$(this).children('.ud-text').html('收起');
					$(this).children('.ud-icon').css('background-image', 'url("images/up.png")');
				} else if (t === '收起') {
					$('#filterList').children('.row').each(function(index) {
						if (index > 1) {
							$(this).css('display', 'none');
						}
					});
					$(this).children('.ud-text').html('更多');
					$(this).children('.ud-icon').css('background-image', 'url("images/down.png")');
				}
			});
		}
	};

	return {
		init: module.init,
		productList: module.getProductList
	};

}(jQuery));

var Index = (function($) {

	var module = {

		/**
		 * 十分咖啡首页初始化方法
		 * @author 王小圆
		 * @public
		 */
		init: function() {
			module.getProductList();
		},

		/**
		 * 首页页面加载完成展示最新的6个项目
		 * @author 王小圆
		 * @public
		 */
		getProductList: function() {
			var data = {
				'page': 1,
				'pageSize': 6
			},
				info = mergeInfo('productList', data);

			$.ajax({
				type: 'POST',
				url: apiUrl,
				data: JSON.stringify(info),
				dataType: 'json',
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': info.length
				},
				success: function(data) {
					var list = data.data['list'];
					for (var i in list) {
						var oneProduct = $('<div class="one-product" />'),
							_a = $('<a />').attr('href', './ProductDetail.php?id=' + list[i].pId),
							_ul1 = $('<ul />'),
							_ul2 = $('<ul />'),
							_li1 = $('<li class="product-name"/>').html(list[i].pName),
							str = '使用' + list[i].engine[0] + '引擎的' + list[i].game2D3D[0] + list[i].artStyle[0] + '风格的' + list[i].gameType[0] + list[i].gamePlatforms[0] + list[i].gameClass[0],
							_li2 = $('<li class="product-des"/>').html(str),
							_li3 = $('<li class="product-img"/>'),
							_li4 = $('<li class="product-attr"/>'),
							_li41 = $('<li />'),
							_li42 = $('<li />'),
							_li43 = $('<li />'),
							_li44 = $('<li />'),
							_p1 = $('<p class="game-icon" />'),
							_p2 = $('<p class="plag-icon" />'),
							_p3 = $('<p class="area-icon" />'),
							_p4 = $('<p class="progress-icon"/>'),
							_span1 = $('<span />').html(list[i].gameClass),
							_span2 = $('<span />').html(list[i].onlinePlatforms[0]),
							_span3 = $('<span />').html(list[i].cCity),
							_span4 = $('<span />').html(list[i].stage);
						getProductImage(list[i].pId, _li3);
						_li41.append(_p1).append(_span1);
						_li42.append(_p2).append(_span2);
						_li43.append(_p3).append(_span3);
						_li44.append(_p4).append(_span4);
						_ul2.append(_li41).append(_li42).append(_li43).append(_li44);
						_li4.append(_ul2);
						_ul1.append(_li1).append(_li2).append(_li3).append(_li4);
						oneProduct.append(_ul1);
						_a.append(oneProduct);
						$('.product-list').append(_a);
					}
				}
			})
		}
	};

	return {
		init: module.init
	};

}(jQuery));

var ProductDetail = (function($) {
	var module = {
		colorArr: ['rgb(41,41,41)', 'rgb(255,156,0)', 'rgb(223,49,25)', 'rgb(14,84,182)', 'rgb(150,70,159)', 'rgb(28,180,230)'],
		pId: 0,

		/**
		 * 十分咖啡详细页初始化方法
		 * @author 王小圆
		 * @public
		 */
		init: function(id) {
			module.pId = id;
			module.getProductInfoById();
			module.getProductImages();
			module.getProductTagSelected();
		},

		/**
		 * 项目详细页获取指定id的基本资料
		 * @author 王小圆
		 * @public
		 */
		getProductInfoById: function() {
			var data = {
				'pId': module.pId
			},
				info = mergeInfo('getProductInfo', data);
			$.ajax({
				type: 'POST',
				url: apiUrl,
				data: JSON.stringify(info),
				dataType: 'json',
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': info.length
				},
				success: function(data) {
					var list = data.data,
						$_name = $('.basic-info-t').children('.product-name'),
						$_productContent = $('.product-introduce-content'),
						$_issuePolicyContent = $('.issuePolicyContent');
					$_name.html(list['name']);
					$_productContent.html(list['productContent']);
					$_issuePolicyContent.html(list['issuePolicyContent']);
					module.getCompanyInfoById(list['cId']);
				}
			});
		},

		/**
		 * 项目详细页获取指定id项目的公司基本信息
		 * @author 王小圆
		 * @public
		 */
		getCompanyInfoById: function(cId) {
			var data = {
				'cId': cId
			},
				info = mergeInfo('getCompanyBasicInfo', data);
			$.ajax({
				type: 'POST',
				url: apiUrl,
				data: JSON.stringify(info),
				dataType: 'json',
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': info.length
				},
				success: function(data) {
					var list = data.data,
						$_companyContent = $('.company-introduce-content'),
						$_financing = $('.financing'),
						state = list['isNeedFinancing'] === '1' ? '是' : '否';
					$_companyContent.html(list['introduction']);
					$_financing.html(state);
				}
			});
		},

		/**
		 * 项目详细页获取指定id的logo和缩略图，并展示
		 * @author 王小圆
		 * @public
		 */
		getProductImages: function() {
			var data = {
				'pId': module.pId
			},
				info = mergeInfo('productImages', data);
			$.ajax({
				type: 'POST',
				url: apiUrl,
				data: JSON.stringify(info),
				dataType: 'json',
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': info.length
				},
				success: function(data) {
					var imagesObj = data.data,
						count = 1;
					for (var i in imagesObj) {
						if (i === 'logo') {
							var $p_logo = $('#product-wrapper').find('.basic-info').children('.left'),
								$_img = $('<img />').addClass('product-logo')
									.attr({
										'alt': '项目LOGO',
										'src': imagesObj[i]
									});
							$p_logo.append($_img);
						} else {
							var $_showImage = $('.show-images-content');
							if (imagesObj[i] && count < 5) {
								var $_a = $('<a />')
									.attr('href', imagesObj[i]),
									$_img = $('<img />')
									.attr({
										'alt': '项目图片' + count,
										'src': imagesObj[i]
									});
								$_a.fancybox();
								$_a.append($_img);
								$_showImage.append($_a);
								count++;
							}
						}
					}
				}
			});
		},

		/**
		 * 项目详细页获取指定id项目的需求
		 * @author 王小圆
		 * @public
		 */
		getProductTagSelected: function() {
			var data = {
				'pId': module.pId
			},
				info = mergeInfo('getProductTagSelected', data);
			$.ajax({
				type: 'POST',
				url: apiUrl,
				data: JSON.stringify(info),
				dataType: 'json',
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': info.length
				},
				success: function(data) {
					var list = data.data,
						$_area = $('.area'),
						$_stage = $('.product-nstage'),
						$_cooperation = $('.cooperation'),
						$_outSource = $('.outSource'),
						$_ul = $('.basic-info-icon').children('ul'),
						count = 0;
					$_area.html(list['area'].join(','));
					$_stage.html(list['nstage']);
					$_cooperation.html(list['cooperation'].join(','));
					$_outSource.html(list['outSource'].join(','));
					for (var i in list) {
						if (typeof list[i] === 'object') {
							var l = list[i];
							if (l.length) {
								for (var j in l) {
									if (count < 20) {
										var index = Math.floor((Math.random() * module.colorArr.length)),
											color = module.colorArr[index];
										var _li = $('<li />').css({
											'border': '2px solid ' + color
										}).html(l[j]);
										$_ul.append(_li);
										++count;
									}
								}
							}
						} else {
							if (count < 20) {
								var index = Math.floor((Math.random() * module.colorArr.length)),
									color = module.colorArr[index];
								var _li = $('<li />').css({
									'border': '2px solid ' + color
								}).html(list[i]);
								$_ul.append(_li);
								++count;
							}
						}
					}
				}
			});
		}
	};

	return {
		init: module.init
	};

}(jQuery));