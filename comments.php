<?php
/** Comments. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( post_password_required() ) { return; }
$uo_count = get_comments_number();
?>
<section id="comments" class="uo-comments" aria-label="评论">
	<h2 class="uo-comments__title">讨论 <small><?php echo esc_html( $uo_count ); ?> 条</small></h2>
	<?php if ( have_comments() ) : ?>
	<ol class="uo-comment-list">
		<?php wp_list_comments( array( 'callback' => 'uo_theme_comment', 'style' => 'ol', 'avatar_size' => 40 ) ); ?>
	</ol>
	<?php the_comments_pagination( array( 'prev_text' => '←', 'next_text' => '→', 'class' => 'uo-pagination' ) ); ?>
	<?php endif; ?>
	<?php if ( comments_open() ) :
		comment_form( array(
			'title_reply'         => '留下你的想法',
			'title_reply_to'      => '回复 %s',
			'cancel_reply_link'   => '取消回复',
			'label_submit'        => '发表评论',
			'comment_notes_before' => '<p class="comment-notes">邮箱不会公开，评论审核后显示。</p>',
			'comment_field'       => '<p class="comment-form-comment"><label for="comment">评论</label><textarea id="comment" name="comment" rows="5" maxlength="65525" required placeholder="写点什么…"></textarea></p>',
		) );
	elseif ( $uo_count ) : ?>
	<p class="comment-notes">评论已关闭。</p>
	<?php endif; ?>
</section>
