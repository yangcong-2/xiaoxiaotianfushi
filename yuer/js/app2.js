let currentPage = 'home';
let currentAge = null;
let currentCat = null;
let currentArticle = null;

function setContent(html) {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('content').innerHTML = html;
}

function init() {
  loadComments();
  restoreFromHash();
}

function restoreFromHash() {
  var hash = location.hash.slice(1);
  if (!hash || hash === 'home') { goHome(); return; }
  if (hash === 'all') { showAll(); return; }
  var parts = hash.split('/');
  if (parts.length === 1) { navAge(parts[0]); return; }
  if (parts.length === 2) { navCat(parts[0], parts[1]); return; }
  if (parts.length === 3) { navArt(parts[0], parts[1], parts[2]); return; }
  goHome();
}

window.addEventListener('popstate', function() {
  restoreFromHash();
});

function goHome() {
  location.hash = 'home';
  document.title = '育儿攻略 - 从怀孕到孩子成年全程指南';
  let h = '<div class="hero"><h1>👶 育儿攻略</h1><p>从怀孕到孩子成年，陪伴每一个家庭科学育儿</p></div><div class="age-grid">';
  contentData.ages.forEach(function(a) {
    let t = a.categories.reduce(function(s,c){return s+c.articles.length;},0);
    h += '<div class="age-card" onclick="navAge(\''+a.id+'\')"><div class="icon">'+a.icon+'</div><h3>'+a.title+'</h3><div class="subtitle">'+a.subtitle+'</div><p>'+a.description+'</p><div class="cat-count">'+a.categories.length+'个板块 · '+t+'篇文章</div></div>';
  });
  h += '</div>';
  setContent(h);
}

function navAge(id) {
  location.hash = id;
  let a = contentData.ages.find(function(x){return x.id===id;});
  if(!a){goHome();return;}
  document.title = a.title+' - 育儿攻略';
  let h = '<div class="age-header"><div class="icon">'+a.icon+'</div><h2>'+a.title+'</h2><div class="desc">'+a.description+'</div></div><div class="cat-grid">';
  a.categories.forEach(function(c){
    h += '<div class="cat-card" onclick="navCat(\''+a.id+'\',\''+c.id+'\')"><div class="icon">'+c.icon+'</div><h4>'+c.title+'</h4><div class="art-count">'+c.articles.length+'篇文章</div></div>';
  });
  h += '</div>';
  setContent(h);
  window.scrollTo(0,0);
}

function navCat(ageId, catId) {
  location.hash = ageId+'/'+catId;
  let a = contentData.ages.find(function(x){return x.id===ageId;});
  if(!a){goHome();return;}
  let c = a.categories.find(function(x){return x.id===catId;});
  if(!c){navAge(ageId);return;}
  document.title = c.title+' - '+a.title+' - 育儿攻略';
  let h = '<div class="breadcrumb"><span onclick="goHome()">首页</span><span class="sep">›</span><span onclick="navAge(\''+a.id+'\')">'+a.title+'</span><span class="sep">›</span><span>'+c.title+'</span></div>';
  h += '<div class="cat-header"><div class="icon">'+c.icon+'</div><h3>'+c.title+'</h3></div><ul class="article-list">';
  c.articles.forEach(function(art){
    let cm = getComments(ageId,catId,art.id);
    h += '<li class="article-item" onclick="navArt(\''+a.id+'\',\''+c.id+'\',\''+art.id+'\')"><h4>'+art.title+'</h4><p>'+art.summary+'</p><div class="stats"><span>💬 '+cm.length+'</span></div></li>';
  });
  h += '</ul>';
  setContent(h);
}

function navArt(ageId, catId, artId) { var theme = getArtTheme(catId+'_'+artId);
  location.hash = ageId+'/'+catId+'/'+artId;
  let a = contentData.ages.find(function(x){return x.id===ageId;});
  if(!a){goHome();return;}
  let c = a.categories.find(function(x){return x.id===catId;});
  if(!c){navAge(ageId);return;}
  let art = c.articles.find(function(x){return x.id===artId;});
  if(!art){navCat(ageId,catId);return;}
  document.title = art.title+' - 育儿攻略';
  let cm = getComments(ageId,catId,artId);
  let liked = localStorage.getItem('liked_'+artId)==='true';
  let h = '<div class="breadcrumb"><span onclick="goHome()">首页</span><span class="sep">›</span><span onclick="navAge(\''+a.id+'\')">'+a.title+'</span><span class="sep">›</span><span onclick="navCat(\''+a.id+'\',\''+c.id+'\')">'+c.title+'</span><span class="sep">›</span><span>'+art.title+'</span></div>';
  h += '<div class="article-detail"><div class="back" onclick="navCat(\''+a.id+'\',\''+c.id+'\')">← 返回'+c.title+'</div>';
  h += '<h2>'+art.title+'</h2>';
  h += '<div class="stats"><span>💬 '+cm.length+' 评论</span><span class="like-btn'+(liked?' liked':'')+'" onclick="toggleLike(\''+artId+'\')">'+(liked?'❤️':'🤍')+' <span id="likeCnt">'+getLikes(artId)+'</span></span></div>';
  h += '<div class="content"><p>'+art.content.replace(/\n/g,'</p><p>')+'</p></div>';
  h += '<div class="role-tips"><div class="role-tip-mom"><div class="role-label mom">👩 妈妈这样做</div><p style="margin-top:8px">'+art.momTips+'</p></div><div class="role-tip-dad"><div class="role-label dad">👨 爸爸这样做</div><p style="margin-top:8px">'+art.dadTips+'</p></div></div>';
  h += renderComments(ageId,catId,artId);
  h += '</div>';
  setContent(h);
  setTimeout(function(){
    let prev = getPrevArt(ageId,catId,artId);
    let next = getNextArt(ageId,catId,artId);
    let nh = '<div class="nav-arrows">';
    nh += prev ? '<a onclick="navArt(\''+ageId+'\',\''+catId+'\',\''+prev.id+'\')">← '+prev.title+'</a>' : '<span></span>';
    nh += next ? '<a onclick="navArt(\''+ageId+'\',\''+catId+'\',\''+next.id+'\')">'+next.title+' →</a>' : '<span></span>';
    nh += '</div>';
    document.querySelector('.article-detail').insertAdjacentHTML('beforeend',nh);
  },50);
}

function getPrevArt(ageId,catId,artId) {
  let a=contentData.ages.find(function(x){return x.id===ageId;}); if(!a)return null;
  let c=a.categories.find(function(x){return x.id===catId;}); if(!c)return null;
  let i=c.articles.findIndex(function(x){return x.id===artId;});
  return i>0?c.articles[i-1]:null;
}
function getNextArt(ageId,catId,artId) {
  let a=contentData.ages.find(function(x){return x.id===ageId;}); if(!a)return null;
  let c=a.categories.find(function(x){return x.id===catId;}); if(!c)return null;
  let i=c.articles.findIndex(function(x){return x.id===artId;});
  return i<c.articles.length-1?c.articles[i+1]:null;
}

function showAll() {
  location.hash = 'all';
  document.title = '所有文章 - 育儿攻略';
  let h = '<div class="page-title"><h2>📚 所有文章</h2><p>浏览全部育儿攻略内容</p></div><div class="all-articles-list">';
  contentData.ages.forEach(function(a){
    h += '<div class="age-group"><h3>'+a.icon+' '+a.title+'</h3>';
    a.categories.forEach(function(c){
      c.articles.forEach(function(art){
        let cm = getComments(a.id,c.id,art.id);
        h += '<div class="art-link" onclick="navArt(\''+a.id+'\',\''+c.id+'\',\''+art.id+'\')">'+art.title+' <span class="cat-label">('+c.title+') 💬 '+cm.length+'</span></div>';
      });
    });
    h += '</div>';
  });
  h += '</div>';
  setContent(h);
}

function toggleLike(artId) {
  let k='liked_'+artId, ck='likeCount_'+artId;
  let liked=localStorage.getItem(k)==='true';
  let cnt=parseInt(localStorage.getItem(ck)||'0');
  if(liked){localStorage.setItem(k,'false');cnt=Math.max(0,cnt-1);localStorage.setItem(ck,cnt.toString());}
  else{cnt++;localStorage.setItem(k,'true');localStorage.setItem(ck,cnt.toString());}
  navArt(currentAge,currentCat,currentArticle);
}
function getLikes(artId){return parseInt(localStorage.getItem('likeCount_'+artId)||'0');}

// Comments
var commentsData = {};
function loadComments(){var d=localStorage.getItem('yuer_comments');if(d){try{commentsData=JSON.parse(d);}catch(e){commentsData={};}}}
function saveComments(){localStorage.setItem('yuer_comments',JSON.stringify(commentsData));}
function getComments(ageId,catId,artId){var k=ageId+'_'+catId+'_'+artId;return commentsData[k]||[];}

function addComment(ageId,catId,artId,author,text,parentId){
  var k=ageId+'_'+catId+'_'+artId;
  if(!commentsData[k])commentsData[k]=[];
  var c={id:Date.now()+'_'+Math.random().toString(36).substr(2,4),author:author||'匿名用户',text:text,time:new Date().toLocaleString('zh-CN'),parentId:parentId||null,replies:[]};
  if(parentId){
    var p=findComment(commentsData[k],parentId);
    if(p){if(!p.replies)p.replies=[];p.replies.push(c);}
  }else{commentsData[k].push(c);}
  saveComments();
  navArt(currentAge,currentCat,currentArticle);
}
function findComment(arr,id){for(var i=0;i<arr.length;i++){if(arr[i].id===id)return arr[i];if(arr[i].replies){var f=findComment(arr[i].replies,id);if(f)return f;}}return null;}

function renderComments(ageId,catId,artId){
  var cs=getComments(ageId,catId,artId);
  var h='<div class="comments-section"><h3>💬 评论互动</h3>';
  h+='<div class="comment-form"><input type="text" id="cName" placeholder="你的昵称" maxlength="20"><textarea id="cText" placeholder="写下你的想法或经验分享..."></textarea><button onclick="submitC(\''+ageId+'\',\''+catId+'\',\''+artId+'\')">发表评论</button></div>';
  if(cs.length===0){h+='<div class="no-comments">还没有评论，来分享你的经验吧</div>';}
  else{h+='<div class="comments-list">';cs.forEach(function(c){h+=renderC(c,ageId,catId,artId,0);});h+='</div>';}
  h+='</div>';return h;
}
function renderC(c,ageId,catId,artId,depth){
  var h='<div class="comment" style="margin-left:'+(depth*20)+'px">';
  h+='<span class="author">'+c.author+'</span><span class="time">'+c.time+'</span>';
  h+='<div class="text">'+c.text+'</div>';
  if(depth<3){
    h+='<span class="reply-btn" onclick="showRF(\''+c.id+'\')">回复</span>';
    h+='<div id="rf_'+c.id+'" style="display:none" class="reply-form">';
    h+='<input type="text" id="rn_'+c.id+'" placeholder="昵称" maxlength="20">';
    h+='<input type="text" id="rt_'+c.id+'" placeholder="回复内容">';
    h+='<button onclick="submitRF(\''+ageId+'\',\''+catId+'\',\''+artId+'\',\''+c.id+'\')">发送</button></div>';
  }
  if(c.replies&&c.replies.length>0){h+='<div class="replies">';c.replies.forEach(function(r){h+=renderC(r,ageId,catId,artId,depth+1);});h+='</div>';}
  h+='</div>';return h;
}
function submitC(ageId,catId,artId){var n=document.getElementById('cName');var t=document.getElementById('cText');if(!t.value.trim()){alert('请输入评论内容');return;}addComment(ageId,catId,artId,n.value.trim()||'匿名用户',t.value.trim(),null);}
function showRF(id){var f=document.getElementById('rf_'+id);f.style.display=f.style.display==='none'?'flex':'none';}
function submitRF(ageId,catId,artId,pid){var n=document.getElementById('rn_'+pid);var t=document.getElementById('rt_'+pid);if(!t.value.trim()){alert('请输入回复内容');return;}addComment(ageId,catId,artId,n.value.trim()||'匿名用户',t.value.trim(),pid);}

function showAbout(){
  var o=document.createElement('div');o.className='modal-overlay active';o.id='aboutModal';
  o.innerHTML='<div class="modal"><span class="close" onclick="closeAbout()">×</span><h3>👶 关于育儿攻略</h3><p>本站是一份全面的育儿指南，内容涵盖从孕期准备到孩子18岁成年的全程养育知识。</p><p>内容按年龄段划分，每个阶段从照护、饮食、早教、天赋挖掘、兴趣培养、学业辅导、社交、认知拓展等多个维度提供指导。</p><p>每条内容都包含妈妈和爸爸的专属建议，欢迎在评论区互动交流！</p><p style="color:#999;font-size:13px;margin-top:12px">本站内容仅供参考，具体医疗建议请咨询专业医生。</p></div>';
  document.body.appendChild(o);
}
function closeAbout(){var m=document.getElementById('aboutModal');if(m)m.remove();}
function toggleMenu(){document.querySelector('header nav').classList.toggle('active');}
document.addEventListener('DOMContentLoaded',init);

