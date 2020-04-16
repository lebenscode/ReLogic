<?php
  
  function v(){
	  echo rand(1, 111111);
  }

?>
<!doctype html>
<html>
<head>
<title>Энциклопедия РЗА</title>
<link rel="stylesheet" href="/css/page.css?<?php v(); ?>" />
<link rel="stylesheet" href="/css/legologic.css?<?php v(); ?>" />
<link rel="shorcut icon" href="/images/favicon.png" />
<script src="/js/reactor.js?<?php v(); ?>"></script>
<script src="/js/relogic.config.js"></script>
<script src="/js/relogic.js?<?php v(); ?>"></script>
<script src="/js/relogic.element.js?<?php v(); ?>"></script>
<script src="/js/relogic.winding.js?<?php v(); ?>"></script>
<script src="/js/relogic.contact.js?<?php v(); ?>"></script>
<script src="/js/relogic.relay.js?<?php v(); ?>"></script>
<script src="/js/relogic.bus.js?<?php v(); ?>"></script>
<script src="/js/relogic.resistor.js?<?php v(); ?>"></script>
<script src="/js/out.ru.js?<?php v(); ?>"></script>
<script src="/js/output.js?<?php v(); ?>"></script>
</head>
<body>
 <div class="navbar_wrap clear_fix">
    <div class="navbar_blue_item">
	  <a href="/">Энциклопедия РЗА</a>
	</div>
	<div class="navbar_item">
	  <a href="/">Векторные диаграммы</a>
	</div>
	<div class="navbar_item">
	  <a href="/scheme.php">Схемы защит</a>
	</div>
   <div class="navbar_item">
	  <a href="/create">Добавить</a>
	</div>
   <div class="navbar_item">
	  <a href="/help">Помощь</a>
	</div>
  <div class="navbar_item">
	  <a href="http://localhost/Tools/phpMyAdmin/" target="_blank">PHPMyAdmin</a>
	</div>
		  </div>
		  <div class="page_box" style="width:1300px;margin:20px auto;">
  <h2 class="page_title">
    <span class="page_title_text">
	 Библиотека схем
	</span>
  </h2>
  <div class="page_content clear_fix">
    <div class="relogic_draw_zone_wrap">
	 <div class="relogic_draw_zone">
		<div id="relay_scheme_logic" style="width:1278px;height:1000px;"></div>
	 </div>
	</div>
  </div> 
</div>
</body>
</html>