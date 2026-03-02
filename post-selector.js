( function( wp ) {
    var el = wp.element.createElement;
    var useState = wp.element.useState;
    var useEffect = wp.element.useEffect;
    var Fragment = wp.element.Fragment;
    var registerBlockVariation = wp.blocks.registerBlockVariation;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var FormTokenField = wp.components.FormTokenField;
    var PanelBody = wp.components.PanelBody;
    var Button = wp.components.Button;
    var useSelect = wp.data.useSelect;
    var apiFetch = wp.apiFetch;
    var addFilter = wp.hooks.addFilter;

    var VARIATION_NAME = 'post-selector/manual';

    // 1. Register the Variation
    registerBlockVariation( 'core/query', {
        name: VARIATION_NAME,
        title: 'Post Selector',
        isActive: function( attr ) { return attr.namespace === VARIATION_NAME; },
        attributes: {
            namespace: VARIATION_NAME,
            query: { 
                postType: 'post', 
                perPage: -1, 
                include: [], 
                orderBy: 'post__in', 
                inherit: false 
            }
        },
        allowedControls: [], // Hides all standard query controls
        scope: [ 'inserter' ],
    } );

    // 2. Add custom Selector UI
    var withPostSelectorControls = wp.compose.createHigherOrderComponent( function( BlockEdit ) {
        return function( props ) {
            var attr = props.attributes;
            if ( props.name !== 'core/query' || attr.namespace !== VARIATION_NAME ) {
                return el( BlockEdit, props );
            }

            var [ searchResults, setSearchResults ] = useState( [] );
            var [ searchInput, setSearchInput ] = useState( '' );

            // Fetch the posts for display based on the IDs saved in the query
            var selectedPosts = useSelect( function( select ) {
                return select( 'core' ).getEntityRecords( 'postType', 'post', {
                    include: attr.query.include.length ? attr.query.include : [0],
                    per_page: -1
                } );
            }, [ attr.query.include ] );

            // Live search for suggestions
            useEffect( function() {
                if ( ! searchInput ) return;
                apiFetch( { path: '/wp/v2/posts?search=' + encodeURIComponent(searchInput) + '&per_page=15' } )
                    .then( function( posts ) {
                        setSearchResults( posts.map( function( p ) { 
                            return { id: p.id, value: p.title.rendered }; 
                        } ) );
                    } );
            }, [ searchInput ] );

            // Map ID array to title array for FormTokenField display
            var tokenValues = attr.query.include.map( function( id ) {
                var post = ( selectedPosts || [] ).find( function( p ) { return p.id === id; } );
                return post ? post.title.rendered : "ID: " + id;
            } );

            return el( Fragment, {},
                el( InspectorControls, {}, 
                    el( PanelBody, { title: 'Post Selector', initialOpen: true },
                        el( FormTokenField, {
                            label: 'Search and Select Posts',
                            value: tokenValues,
                            suggestions: searchResults.map( function( s ) { return s.value; } ),
                            onInputChange: function( val ) { setSearchInput( val ); },
                            onChange: function( tokens ) {
                                // Match the strings back to IDs to save them
                                var newIds = tokens.map( function( t ) {
                                    var found = ( ( selectedPosts || [] ).concat( searchResults ) ).find( function( p ) {
                                        var title = p.title ? p.title.rendered : p.value;
                                        return title === t;
                                    } );
                                    // Fallback to parsing ID if title lookup fails (e.g. during loading)
                                    return found ? found.id : parseInt( t.replace( 'ID: ', '' ) );
                                } ).filter( Boolean );

                                props.setAttributes( { 
                                    query: Object.assign( {}, attr.query, { 
                                        include: newIds, 
                                        perPage: -1,
                                        orderBy: 'post__in' 
                                    } ) 
                                } );
                            },
                            __experimentalExpandOnFocus: true
                        } ),
                        el( 'p', { style: { fontSize: '11px', color: '#757575', marginTop: '10px' } }, 
                            'Type to find posts by title. The order of tags here will be the order they appear on the site.'
                        ),
                        attr.query.include.length > 0 && el( Button, {
                            isDestructive: true,
                            isSmall: true,
                            style: { marginTop: '15px' },
                            onClick: function() { 
                                props.setAttributes( { query: Object.assign( {}, attr.query, { include: [] } ) } ); 
                            }
                        }, 'Clear Selection' )
                    )
                ),
                el( BlockEdit, props )
            );
        };
    }, 'withPostSelectorControls' );

    addFilter( 'editor.BlockEdit', 'core/query', withPostSelectorControls );

} )( window.wp );