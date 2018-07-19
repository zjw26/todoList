$(document).ready(function(){
	var task_list=[];
	var i;
	init();
	$('.add-task button').on('click',function(){
	    add_event();
	})
	$(document).on('keyup',function(e){
		if(e.keyCode==13){
			add_event();
		}

	})

	function add_event(){
		/*获取新Task的值*/
	    var new_task={};
	    var $input = $(".add-task").find('input[name=content]');
	    new_task.content = $input.val();
	    /*如果新Task的值为空 则直接返回 否则继续执行*/
	    if (!new_task.content) return;
	    /*存入新Task*/
	    if (add_task(new_task)) {
	      // render_task_list();
	      $input.val(null);
	    }
	}

	//刷新Localstorage，并更新页面
	function refresh_task_list(){
		store.set('task_list',task_list);
		render_task_list();
	}

	function add_task(obj){
		task_list.push(obj);
		refresh_task_list();
		return 1;
	}

	function delete_task(index){
		task_list.splice(index,1);
		refresh_task_list();
		
	}

	function deleteAll(){
		task_list.length=0;
		refresh_task_list();
	}

	function init(){
		task_list=store.get('task_list')||[];
		listen_msg_event();
		if(task_list.length){
			render_task_list();
			task_remind_check();
		}
	}

	function task_remind_check(){
		var current_time;
		var timer=setInterval(function(){
			for(var i=0; i<task_list.length; i++){
				var item=task_list[i];
				var task_time;
				if(!item || !item.remind_date||item.informed){
					continue;
				}else{
					current_time=(new Date()).getTime();
					task_time=(new Date(item.remind_date)).getTime();
					if(current_time-task_time>=1){
						update_task(i,{informed:true});
						show_msg(item.content);
					}

				}
			}
		},300);
		
	}

	function show_msg(msg){
	   if (!msg) return;
	   $('.msg-content').html("事件:"+msg);
	   $('.alerter').get(0).play();
	   $('.msg').show(300);
	}

  	function hide_msg() {
    	$('.msg').hide(300);
  	}

    function listen_msg_event(){
	   $('.msg .confirmed').on('click', function () {
	     hide_msg();
	   })
	}

	//更新页面
	function render_task_list(){
		var $task_list = $('.task-list');
		    $task_list.html('');
			var complete_items=[];
			for(var i=0;i<task_list.length;i++){
				if(task_list[i]&&task_list[i].complete){
					complete_items[i]=task_list[i];
				}
				else{
					var $task=render_task_tpl(task_list[i],i);
					$task_list.prepend($task);
				}
			}

			for(var j=0;j<complete_items.length;j++){
				$task=render_task_tpl(complete_items[j],j);
				if(!$task) continue;
				$task.toggleClass('completed');
				$task_list.append($task);
			}
		listen_list_deleteAll();
		listen_list_delete();
		listen_list_detail();
		listen_checkbox_complete();
	}

	function render_task_tpl(data,index){
		if(!data||!index==undefined) return;
		// var list_item_tpl=
		// '<div class="task-item" data-index="' + index +'">'+
		// '<span><input name="complete" class="complete" ' + (data.complete ? 'checked' : '') + ' type="checkbox" id="checkbox'+index+'"></span>' +
		// '<label class="task-content" for="checkbox'+index+'">'+data.content+'</label>'+
		// '<span class="action delete" data-toggle="modal" data-target="#delete">删除</span>'+
		// '<span class="action detail">详细</span>'+
		// '</div>';
		let complete=data.complete ? 'checked' : '';
		let list_item_tpl=
		`<div class="task-item" data-index="${index}"> 
		<span><input name="complete" class="complete" ${complete} type="checkbox" id="checkbox${index}"></span>
		<label class="task-content" for="checkbox${index}">${data.content}</label>
		<span class="action delete" data-toggle="modal" data-target="#delete">删除</span>
		<span class="action detail">详细</span>
		</div>`
		
		return $(list_item_tpl);
	}

	function listen_list_delete(){
		$(".task-item span.delete").on("click",function(e){
			var index=$(this).parent().data('index');
			listen_yes(index);
		})

	}



	function listen_yes(index){console.log(index)
		$("#yes").one("click",function(e){
			delete_task(index);
		})
	}

	function listen_list_detail(){
		$(".task-item span.detail").on("click",function(){
			 var $this = $(this);
		      var $item = $this.parent();
		      index = $item.data('index');
		      show_task_detail(index);
		      hide_task_detail(index);
		})
		$("div.task-item").on("dblclick",function(){
			 var $this = $(this);
		      var $item = $this;
		      index = $item.data('index');
		      show_task_detail(index);
		      hide_task_detail(index);
		})
	}

	function listen_list_deleteAll(){
		$("#yesAll").on("click",function(){
			deleteAll();
		})
	}

	function listen_checkbox_complete(){
		$(".task-item input[name=complete]").on('click',function(){
			$this=$(this);
			// $this.parents('.task-item').toggleClass('completed');
			var index=$this.parents('.task-item').data('index');
			var item = task_list[index];
		      if (item.complete)
		        update_task(index, {complete: false});
		      else
		        update_task(index, {complete: true});
		})
	}

	// function get(index) {
 //    return store.get('task_list')[index];
 //  }

	function show_task_detail(index){
	if($('.task-detail-mask').css("display")=="none"){
		render_task_detail(index);
		$('.task-detail-mask').show(200);
		$('.task-detail').show(500);
		}
	}
	function hide_task_detail(index){
	if($('.task-detail-mask').css("display")=="block"){
			$('.task-detail-mask').click(function(){
				$('.task-detail-mask').hide(500);
				$('.task-detail').hide(200);
			})
		}
	}

	function render_task_detail(index){
		if(index==undefined||!task_list[index]) return;
		var item=task_list[index];
		// var tpl='<div class="abc" data-index='+index+'>'+
		// 	'<div class="content">'+
		// 	item.content+
		// 	'</div>'+
		// 	'<div class="input-item">' +
	 //        '<input style="display: none;" type="text" name="content" value="' + (item.content || '') + '">' +
	 //        '</div>' +
		// 	// '<div class="input-item">'+
		// 	// '<input type="text" name="content" placeholder="请输入要更改的内容"> <span style="color:red;padding-left:6px;"></span>'+
		// 	// '</div>'+
		// 	'<div>'+
		// 	'<div class="desc input-item">'+
		// 	'<textarea name="desc" placeholder="请输入具体描述">'+(item.desc||'')+'</textarea>'+
		// 	'</div>'+
		// 	'</div>'+
		// 	'<div class="remind input-item">'+
		// 	'<label style="display:block;padding-bottom:10px;">提醒时间</label>'+
		// 	'<input class="datetime" name="remind_date" type="text" value="'+(item.remind_date||'')+'">'+
		// 	'</div>'+
		// 	'<div class="input-item">'+
		// 	'<button type="submit" class="btn btn-warning">更新</button>'+
		// 	'</div>'+
		// 	'</div>';
		var tpl=
		`<div class="abc" data-index=${index}>
		<div class="content">${item.content}</div>
		<div class="input-item"><input style="display: none;" type="text" name="content" value="${item.content}"></div>
		<div><div class="desc input-item"><textarea name="desc" placeholder="请输入具体描述">${item.desc}</textarea></div></div>
		<div class="remind input-item"><label style="display:block;padding-bottom:10px;">提醒时间</label>
		<input class="datetime" name="remind_date" type="text" value="${item.remind_date||''}"></div>
		<div class="input-item"><button type="submit" class="btn btn-warning">更新</button></div>
		</div>`

		$('.task-detail .form').html(null);
		$('.task-detail .form').html(tpl);
		var bottom=$(document).height()/2-$('.task-detail').height()/2;
		var right=$(document).width()/2-$('.task-detail').width()*2/3;
		$('.task-detail').css({
			"bottom":bottom,
			"right":right
		})

			 /*选中显示Task内容的元素*/
	    $task_detail_content = $('form.form').find('.content');
	    /*选中Task input的元素*/
	    $task_detail_content_input = $('form.form').find('[name=content]');
	    $('.datetime').datetimepicker();

		$task_detail_content.on('dblclick', function () {
	      $task_detail_content_input.show(300);
	      $task_detail_content.hide(300);
	    })
		$('.task-detail form').on('submit', function (e) {
			 var index=$(this).find('.abc').data('index');
		      var data = {};
		      /*获取表单中各个input的值*/
		      data.content = $(this).find('[name=content]').val();
		      data.desc = $(this).find('[name=desc]').val();
		      data.remind_date = $(this).find('[name=remind_date]').val();
		       console.log(data);
		      update_task(index,data);
		  })


	}

	function update_task(index,data){
		// console.log(index);
		if(index==undefined||!task_list[index]) return;
		task_list[index]=$.extend({},task_list[index],data);
		refresh_task_list();
	}


	
})
