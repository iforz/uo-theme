<?php
/** Presentation boundaries and option sanitation, without a live database. */
define('ABSPATH', __DIR__);
function add_action() {} function add_filter() {}
function sanitize_text_field($s){return trim(strip_tags($s));}
function wp_strip_all_tags($s){return strip_tags($s);}
function get_option($key,$fallback=[]){return $GLOBALS['opts'][$key]??$fallback;}
function wp_parse_args($a,$b){return array_merge($b,$a);}
function wp_date(){return '2026';} function get_bloginfo(){return 'Site';}
function is_admin(){return $GLOBALS['admin']??false;} function is_feed(){return false;}
function is_singular($type){return true;} function get_queried_object_id(){return 7;}
function post_password_required(){return $GLOBALS['protected']??false;}
function get_permalink(){return 'https://example.test/post/';} function get_the_title(){return '<Title>';}
function esc_url($s){return htmlspecialchars($s,ENT_QUOTES,'UTF-8');} function esc_attr($s){return htmlspecialchars($s,ENT_QUOTES,'UTF-8');}
function comments_open(){return true;} function get_comments_number(){return 0;} function absint($s){return abs((int)$s);}
function get_the_ID(){return 7;} function get_post_type(){return 'post';}
function get_theme_file_uri($s){return 'https://example.test/theme/'.$s;}
function add_query_arg($k,$v,$s){return $s.'?'.$k.'='.$v;}
function wp_get_theme(){return new class{function get(){return '0.5.0';}};}
require dirname(__DIR__).'/inc/reading.php';
function expect($v,$message){if(!$v)throw new Exception($message);}
$GLOBALS['opts']=['wpicp_license'=>'蜀ICP备2024046028号-1','kratos_options'=>['s_copyright'=>'<b>Copyright</b>']];
expect(uo_theme_footer_options()['icp']==='蜀ICP备2024046028号-1','Legacy ICP');expect(uo_theme_footer_options()['copyright']==='Copyright','Plain legacy copyright');
expect(uo_theme_sanitize_footer(['icp'=>['bad'],'copyright'=>'<b>Text</b>'])===['icp'=>'','copyright'=>'Text'],'Sanitized inputs');
$html='<div class="uo-reading-content">Body</div>';$block=['attrs'=>['className'=>'uo-reading-content']];$out=uo_theme_reading_actions($html,$block);
expect(strpos($out,'data-uo-copy-text')>strpos($out,'Body'),'Tools follow body');expect(strpos($out,'data-title="&lt;Title&gt;"')!==false,'Escaped title');expect(strpos($out,'href="#comments"')!==false,'Comment anchor');
expect(uo_theme_reading_actions($html,['attrs'=>[]])===$html,'Other content unchanged');
$GLOBALS['protected']=true;expect(uo_theme_reading_actions($html,$block)===$html,'Protected content');expect(uo_theme_cover_fallback('',[])==='','Protected cover');$GLOBALS['protected']=false;
expect(uo_theme_cover_fallback('<figure>Custom</figure>',[])==='<figure>Custom</figure>','Authored images retained');
$out=uo_theme_cover_fallback('',['attrs'=>['isLink'=>true]]);expect(strpos($out,'data-uo-cover')!==false&&strpos($out,'loading="lazy"')!==false&&strpos($out,'target="_blank"')!==false,'Local decorative cover');
$GLOBALS['admin']=true;expect(uo_theme_reading_actions($html,$block)===$html,'Admin unchanged');expect(uo_theme_cover_fallback('',[])==='','Editor unchanged');
echo "PASS: legacy legal options, sanitation, post tools, protected/admin boundaries and featured image priority.\n";
