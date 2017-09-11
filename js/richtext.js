/* globals jQuery, alert */
jQuery(function( $ ) {
	'use strict';

	var richTextSelector = 'textarea.shortcake-richtext, #inner_content';
	var richText = {};
	var modalFrame;


	$(document).on('click', '.shortcake-insert-media-modal', function(event){

		if ( ! modalFrame ) {
			modalFrame= wp.media( {
				multiple: false
			} );
			modalFrame.on( 'select', function(event) {
				// Get media attachment details from the frame state
				var attachment = modalFrame.state().get('selection').first().toJSON();

				var $img = $(
					'<img>',
					{
						src: attachment.url,
						alt: attachment.alt
					}
				);
				tinymce
					.get($( this ).data('editor' ))
					.insertContent($img.prop('outerHTML'));
			}.bind( this ) );
		}

		modalFrame.open();

	});

	/**
	 * Loads tinyMCE rich text editor.
	 *
	 * @param {string} selector
	 * @returns {boolean}
	 */
	richText.load = function( selector ) {
		if ( ( 'undefined' !== tinyMCE ) && ( $( selector ).length ) ) {
			$( selector ).each( function() {

				var textarea_id = $(this).attr('id');
				var $this = $(this);

				if( null === tinyMCE.get( textarea_id ) ) {

					// Add a slight delay to offset the loading of any elements on the page. Sometimes doesn't load correctly
					setTimeout(function () {
						var $button = $(
							'<button>',
							{
								type: 'button',
								"class": 'button shortcake-insert-media-modal',
								text: 'Add Media'
							}
						).data('editor', textarea_id);
						$this.before($button);
						// Bind tinyMCE to this field
						tinyMCE.execCommand('mceAddEditor', false, textarea_id );
						tinyMCE.execCommand('mceAddControl', false, textarea_id );
					}, 200);

				}

			});

			return true;
		} else {
			return false;
		}
	};

	/**
	 * Unloads tinyMCE rich text editor.
	 *
	 * @param {string} selector
	 * @returns {boolean}
	 */
	richText.unload = function( selector ) {

		if ( ( $( selector ).length ) ) {
			$( selector ).each( function() {
				var textarea_id = $( this).attr('id');

				$( this )
					.text( tinyMCE.get( textarea_id ).getContent() )
					.trigger( 'input' );

				// Remove tinyMCE from the field
				tinymce.execCommand( 'mceRemoveEditor', true, textarea_id );
			});

			// Switch the global active editor back to the WordPress editor
			wpActiveEditor = 'content';

			return true;
		} else {
			return false;
		}
	};

	if ( 'undefined' !== typeof( wp.shortcake ) ) {
		wp.shortcake.hooks.addAction( 'shortcode-ui.render_edit', function() {

			// Dynamically bind to newly inserted elements as the action is fired after the field has been added
			$(document).bind( 'DOMNodeInserted', function(e) {
				var element = e.target;

				if( $( element ).hasClass( 'shortcode-ui-content-insert' ) ) {
					richText.loaded = richText.load( $( element ).find( richTextSelector ) );
				}

			});

			richText.loaded = richText.load( richTextSelector );
		} );
		wp.shortcake.hooks.addAction( 'shortcode-ui.render_new', function() {
			richText.loaded = richText.load( richTextSelector );
		} );
		wp.shortcake.hooks.addAction( 'shortcode-ui.render_destroy', function() {
			if ( richText.loaded ) {
				richText.unload( richTextSelector );
			}
		} );
	}

} );
