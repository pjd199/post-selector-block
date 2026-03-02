<?php
/**
 * Plugin Name: Post Selector Block
 * Description: Manually select posts to display on a page.
 * Version: 1.0.0
 * Author: Pete Dibdin
 */

if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'enqueue_block_editor_assets', function() {
    wp_enqueue_script(
        'post-selector-js',
        plugins_url( 'post-selector.js', __FILE__ ),
        array( 'wp-blocks', 'wp-element', 'wp-components', 'wp-data', 'wp-api-fetch', 'wp-compose', 'wp-i18n', 'wp-block-editor' ),
        filemtime( plugin_dir_path( __FILE__ ) . 'post-selector.js' )
    );
});

/**
 * High-priority frontend query override.
 */
add_filter( 'pre_render_block', function( $block_content, $block ) {
    if ( 'core/query' !== $block['blockName'] ) return $block_content;

    $attrs = $block['attrs'];
    if ( ! isset( $attrs['namespace'] ) || 'post-selector/manual' !== $attrs['namespace'] ) {
        return $block_content;
    }

    $include = $attrs['query']['include'] ?? [];

    add_filter( 'query_loop_block_query_vars', function( $query ) use ( $include ) {
        if ( ! empty( $include ) ) {
            $query['post__in'] = $include;
            $query['orderby'] = 'post__in';
            $query['post_type'] = 'post';
            $query['posts_per_page'] = -1; 
            $query['nopaging'] = true;
            $query['ignore_sticky_posts'] = true;
            $query['inherit'] = false;
            unset( $query['category__in'], $query['tag__in'], $query['tax_query'], $query['author__in'] );
        } else {
            $query['post__in'] = array( 0 );
        }
        return $query;
    }, 30 );

    return $block_content;
}, 10, 2 );