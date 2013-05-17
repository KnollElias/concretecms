/**
 * Sitemap proxy functions to dynatree
 */


(function($, window) {

  var methods = {

    private:  {

    	reloadNode: function(node, onComplete) {
    		
    		var params = {
				url: CCM_TOOLS_PATH + '/dashboard/sitemap_data',
				data: {
					node: node.data.cID
				}
			};
			if (onComplete) {
				params.success = onComplete;
			}

			node.appendAjax(params);

    	},

    	rescanDisplayOrder: function(node) {

			node.setLazyNodeStatus(DTNodeStatus_Loading);	
			var childNodes = node.getChildren();
			var params = [];
			for (i = 0; i < childNodes.length; i++) {
				var childNode = childNodes[i];
				params.push({'name': 'cID[]', 'value': childNode.data.cID});
			}
			$.ajax({
				dataType: 'json',
				type: 'POST',
				data: params,
				url: CCM_TOOLS_PATH + '/dashboard/sitemap_update',
				success: function(r) {
					ccm_parseJSON(r, function() {});
					node.setLazyNodeStatus(DTNodeStatus_Ok);
				}
			});
    	},


    	selectMoveCopyTarget: function(instanceID, node, destNode, dragMode) {

			var dialog_title = ccmi18n_sitemap.moveCopyPage;
			if (!dragMode) {
				var dragMode = '';
			}
			var dialog_url = CCM_TOOLS_PATH + '/dashboard/sitemap_drag_request.php?instance_id=' + instanceID + '&origCID=' + node.data.cID + '&destCID=' + destNode.data.cID + '&dragMode=' + dragMode;
			var dialog_height = 350;
			var dialog_width = 350;
			
			$.fn.dialog.open({
				title: dialog_title,
				href: dialog_url,
				width: dialog_width,
				modal: false,
				height: dialog_height,
				onOpen: function() {
					$('#ctaskMove').on('click', function() {
						if ($("#copyThisPage").get(0)) {
							$("#copyThisPage").get(0).disabled = true;
							$("#copyChildren").get(0).disabled = true;
							$("#saveOldPagePath").attr('disabled', false);
						}
					});

					$('#ctaskAlias').on('click', function() {
						if ($("#copyThisPage").get(0)) {
							$("#copyThisPage").get(0).disabled = true;
							$("#copyChildren").get(0).disabled = true;
							$("#saveOldPagePath").attr('checked', false);
							$("#saveOldPagePath").attr('disabled', 'disabled');
						}
					});

					$('#ctaskCopy').on('click', function() {
						if ($("#copyThisPage").get(0)) {
							$("#copyThisPage").get(0).disabled = false;
							$("#copyThisPage").get(0).checked = true;
							$("#copyChildren").get(0).disabled = false;
							$("#saveOldPagePath").attr('checked', false);
							$("#saveOldPagePath").attr('disabled', 'disabled');
						}
					});
				}

			});

			$('[data-sitemap-instance-id=' + instanceID + ']').on('dragRequestComplete', function(e, mode) {

				if (mode == 'MOVE') {
					// remove the original
					node.remove();
				}

				destNode.removeChildren();
				var cID = destNode.data.cID;
				methods.private.reloadNode(destNode, function() {
					if (!destNode.bExpanded) {
						destNode.expand(true);
					}
				});

				$(this).unbind('dragRequestComplete');
			});
    	},

    	getMenu: function(instanceID, data) {
    		var menu = '<div data-sitemap-instance-id="' + instanceID + '" class="ccm-sitemap-menu popover fade"><div class="arrow"></div><div class="popover-inner">';
    		menu += '<ul class="dropdown-menu">';
    		if (data.isTrash && data.numSubpages) {
    			menu += '<li><a onclick="$.fn.ccmsitemap(\'deleteForever\', this, ' + data.cID + ')" href="javascript:void(0)">' + ccmi18n_sitemap.emptyTrash + '<\/a><\/li>';
    		} else if (data.isInTrash) {
    			menu += '<li><a onclick="ccm_previewInternalTheme(' + data.cID + ', false, \'' + ccmi18n_sitemap.previewPage + '\')" href="javascript:void(0)">' + ccmi18n_sitemap.previewPage + '<\/a><\/li>';
    			menu += '<li class="divider"><\/li>';
    			menu += '<li><a onclick="$.fn.ccmsitemap(\'deleteForever\', this, ' + data.cID + ')" href="javascript:void(0)">' + ccmi18n_sitemap.deletePageForever + '<\/a><\/li>';
    		}  else if (data.cAlias == 'LINK' || data.cAlias == 'POINTER') {

    			menu += '<li><a onclick="window.location.href=\'' + CCM_DISPATCHER_FILENAME + '?cID=' + data.cID + '\'" href="javascript:void(0)">' + ccmi18n_sitemap.visitExternalLink + '<\/a><\/li>';
				if (data.cAlias == 'LINK' && data.canEditProperties) {
    				menu += '<li><a dialog-width="350" dialog-height="170" dialog-title="' + ccmi18n_sitemap.editExternalLink + '" dialog-modal="false" dialog-append-buttons="true" href="' + CCM_TOOLS_PATH + '/edit_collection_popup.php?rel=SITEMAP&cID=' + data.cID + '&ctask=edit_external">' + ccmi18n_sitemap.editExternalLink + '<\/a><\/li>';
				}
				if (data.canDelete) {
					menu += '<li><a dialog-width="360" dialog-height="150" dialog-modal="false" dialog-title="' + ccmi18n_sitemap.deleteExternalLink + '" href="' + CCM_TOOLS_PATH + '/edit_collection_popup.php?rel=SITEMAP&cID=' + data.cID + '&display_mode=' + data.display_mode + '&instance_id=' + instanceID + '&select_mode=' + data.select_mode + '&ctask=delete_external">' + ccmi18n_sitemap.deleteExternalLink + '<\/a><\/li>';
				}
    			menu += '<li><a onclick="$.fn.ccmsitemap(\'deleteForever\', this, ' + data.cID + ')" href="javascript:void(0)">' + ccmi18n_sitemap.deletePageForever + '<\/a><\/li>';
			} else {

				menu += '<li><a href="' + CCM_DISPATCHER_FILENAME + '?cID=' + data.cID + '">' + ccmi18n_sitemap.visitPage + '<\/a><\/li>';

				if (data.canEditPageProperties || data.canEditPageSpeedSettings || data.canEditPagePermissions || data.canEditPageDesign || data.canViewPageVersions || data.canDeletePage) { 
					menu += '<li class=\"divider\"><\/li>';
				}
				if (data.canEditPageProperties) {
					menu += '<li><a class="dialog-launch" dialog-on-close="$.fn.ccmsitemap(\'exitEditMode\', ' + data.cID + ')" dialog-width="850" dialog-height="360" dialog-modal="false" dialog-title="' + ccmi18n_sitemap.pagePropertiesTitle + '" href="' + CCM_TOOLS_PATH + '/edit_collection_popup.php?rel=SITEMAP&cID=' + data.cID + '&ctask=edit_metadata">' + ccmi18n_sitemap.pageProperties + '<\/a><\/li>';
				}
				if (data.canEditPageSpeedSettings) { 
					menu += '<li><a class="dialog-launch" dialog-on-close="$.fn.ccmsitemap(\'exitEditMode\', ' + data.cID + ')" dialog-width="550" dialog-height="280" dialog-modal="false" dialog-title="' + ccmi18n_sitemap.speedSettingsTitle + '" href="' + CCM_TOOLS_PATH + '/edit_collection_popup.php?rel=SITEMAP&cID=' + data.cID + '&ctask=edit_speed_settings">' + ccmi18n_sitemap.speedSettings + '<\/a><\/li>';
				}
				if (data.canEditPagePermissions) { 
					menu += '<li><a class="dialog-launch" dialog-on-close="$.fn.ccmsitemap(\'exitEditMode\', ' + data.cID + ')" dialog-width="420" dialog-height="630" dialog-modal="false" dialog-title="' + ccmi18n_sitemap.setPagePermissions + '" href="' + CCM_TOOLS_PATH + '/edit_collection_popup.php?rel=SITEMAP&cID=' + data.cID + '&ctask=edit_permissions">' + ccmi18n_sitemap.setPagePermissions + '<\/a><\/li>';
				}
				if (data.canEditPageDesign) { 
					menu += '<li><a class="dialog-launch" dialog-on-close="$.fn.ccmsitemap(\'exitEditMode\', ' + data.cID + ')" dialog-width="610" dialog-height="405" dialog-modal="false" dialog-title="' + ccmi18n_sitemap.pageDesign + '" href="' + CCM_TOOLS_PATH + '/edit_collection_popup.php?rel=SITEMAP&cID=' + data.cID + '&ctask=set_theme">' + ccmi18n_sitemap.pageDesign + '<\/a><\/li>';
				}
				if (data.canViewPageVersions) {
					menu += '<li><a class="dialog-launch" dialog-on-close="$.fn.ccmsitemap(\'exitEditMode\', ' + data.cID + ')" dialog-width="640" dialog-height="340" dialog-modal="false" dialog-title="' + ccmi18n_sitemap.pageVersions + '" href="' + CCM_TOOLS_PATH + '/versions.php?rel=SITEMAP&cID=' + data.cID + '">' + ccmi18n_sitemap.pageVersions + '<\/a><\/li>';
				}
				if (data.canDeletePage) { 
					menu += '<li><a class="dialog-launch" dialog-on-close="$.fn.ccmsitemap(\'exitEditMode\', ' + data.cID + ')" dialog-width="360" dialog-height="150" dialog-modal="false" dialog-title="' + ccmi18n_sitemap.deletePage + '" href="' + CCM_TOOLS_PATH + '/edit_collection_popup.php?rel=SITEMAP&cID=' + data.cID + '&display_mode=' + data.display_mode + '&instance_id=' + instanceID + '&select_mode=' + data.select_mode + '&ctask=delete">' + ccmi18n_sitemap.deletePage + '<\/a><\/li>';
				}
				if (data.display_mode == 'explore' || data.display_mode == 'search') {
					menu += '<li class=\"divide\"><\/li>';
					menu += '<li><a class="dialog-launch" dialog-width="90%" dialog-height="70%" dialog-modal="false" dialog-title="' + ccmi18n_sitemap.moveCopyPage + '" href="' + CCM_TOOLS_PATH + '/sitemap_search_selector?sitemap_select_mode=move_copy_delete&cID=' + data.cID + '" id="menuMoveCopy' + data.cID + '">' + ccmi18n_sitemap.moveCopyPage + '<\/a><\/li>';
					if (data.display_mode == 'explore') {
						menu += '<li><a href="' + CCM_DISPATCHER_FILENAME + '/dashboard/sitemap/explore?cNodeID=' + data.cID + '&task=send_to_top">' + ccmi18n_sitemap.sendToTop + '<\/a><\/li>';
						menu += '<li><a href="' + CCM_DISPATCHER_FILENAME + '/dashboard/sitemap/explore?cNodeID=' + data.cID + '&task=send_to_bottom">' + ccmi18n_sitemap.sendToBottom + '<\/a><\/li>';
					}
				}
				if (data.numSubpages > 0) {
					menu += '<li class=\"divider\"><\/li>';

					var searchURL = CCM_DISPATCHER_FILENAME + '/dashboard/sitemap/search/?selectedSearchField[]=parent&cParentAll=1&cParentIDSearchField=' + data.cID;
				
					if (data.display_mode == 'full' || data.display_mode == '' || data.display_mode == 'explore') {
						menu += '<li><a class="ccm-menu-icon ccm-icon-search-pages" href="' + searchURL + '">' + ccmi18n_sitemap.searchPages + '<\/a><\/li>';
					}
					if (data.display_mode != 'explore') {
						menu += '<li><a href="' + CCM_DISPATCHER_FILENAME + '/dashboard/sitemap/explore/-/' + data.cID + '">' + ccmi18n_sitemap.explorePages + '<\/a><\/li>';
					}
				
				}
				if (data.canAddSubpages || data.canAddExternalLinks) { 
					menu += '<li class=\"divider\"><\/li>';
				}

				if (data.canAddExternalLinks) {
					menu += '<li><a class="dialog-launch" dialog-width="350" dialog-modal="false" dialog-height="170" dialog-title="' + ccmi18n_sitemap.addExternalLink + '" dialog-modal="false" href="' + CCM_TOOLS_PATH + '/edit_collection_popup.php?rel=SITEMAP&cID=' + data.cID + '&ctask=add_external">' + ccmi18n_sitemap.addExternalLink + '<\/a><\/li>';
				}

			}

    		menu += '</ul></div></div>';
    		var $menu = $(menu);
    		if ($menu.find('li').length == 0) {
    			return false;
    		}

    		return $menu;
    	}

    },

    exitEditMode: function(cID) {
		$.get(CCM_TOOLS_PATH + "/dashboard/sitemap_check_in?cID=" + cID  + "&ccm_token=" + CCM_SECURITY_TOKEN);
    },

    deleteForever: function(link, cID, isTrash) {
		var instanceID = $(link).closest('div.ccm-sitemap-menu').attr('data-sitemap-instance-id');
		var node = $('[data-sitemap-instance-id=' + instanceID + ']').dynatree('getActiveNode');
		var isTrash = node.data.isTrash;
		if (isTrash) {
			var trash = node;
			var numSubpages = trash.data.numSubpages - 1;
    	} else {
    		var trash = node.parent;
    	}

		var dialogTitle = (isTrash) ? ccmi18n_sitemap.emptyTrash : ccmi18n_sitemap.deletePages;
		var params = [];
		ccm_triggerProgressiveOperation(
			CCM_TOOLS_PATH + '/dashboard/sitemap_delete_forever', 
			[{'name': 'cID', 'value': cID}],
			dialogTitle,
			function() {
				trash.reloadChildren();
				if (isTrash) {
					trash.data.numSubpages = numSubpages;
				}
				ccmAlert.hud(ccmi18n_sitemap.deletePageSuccessMsg, 2000);
			}
		);

    },

	submitDragRequest: function() {
	
		var origCID = $('#origCID').val();
		var destParentID = $('#destParentID').val();
		var destCID = $('#destCID').val();
		var dragMode = $('#dragMode').val();
		var destSibling = $('#destSibling').val();
		var ctask = $("input[name=ctask]:checked").val();
		var instance_id = $("input[name=instance_id]").val();
		var display_mode = $("input[name=display_mode]").val();
		var select_mode = $("input[name=select_mode]").val();
		var copyAll = $("input[name=copyAll]:checked").val();
		var saveOldPagePath = $("input[name=saveOldPagePath]:checked").val();

		params = {
		
			'origCID': origCID,
			'destCID': destCID,
			'ctask': ctask,
			'ccm_token': CCM_SECURITY_TOKEN,
			'copyAll': copyAll,
			'destSibling': destSibling,
			'dragMode': dragMode,
			'saveOldPagePath': saveOldPagePath
		};


		if (copyAll == 1) {

			var dialogTitle = ccmi18n_sitemap.copyProgressTitle;
			ccm_triggerProgressiveOperation(
				CCM_TOOLS_PATH + '/dashboard/sitemap_copy_all', 
				[{'name': 'origCID', 'value': origCID}, {'name': 'destCID', 'value': destCID}],
				dialogTitle, function() {
					$('.ui-dialog-content').dialog('close');
					openSub(instance_id, destParentID, display_mode, select_mode, function() {openSub(instance_id, destCID, display_mode, select_mode)});
				}
			);

		} else {

			jQuery.fn.dialog.showLoader();

			$.getJSON(CCM_TOOLS_PATH + '/dashboard/sitemap_drag_request.php', params, function(resp) {
				// parse response
				ccm_parseJSON(resp, function() {
					jQuery.fn.dialog.closeAll();
					jQuery.fn.dialog.hideLoader();
		 			ccmAlert.hud(resp.message, 2000);
		 			$('[data-sitemap-instance-id=' + instance_id + ']').trigger('dragRequestComplete', [ctask]);
					jQuery.fn.dialog.closeTop();
					jQuery.fn.dialog.closeTop();
				});
			});
		}
	},

    init: function(options) {

    	$('#ccm-show-all-pages-cb').on('click', function() {
			var showSystemPages = $(this).get(0).checked == true ? 1 : 0;
			$.get(CCM_TOOLS_PATH + "/dashboard/sitemap_data.php?show_system=" + showSystemPages, function(resp) {
				location.reload();
			});
    	});
    	$.fn.ccmmenu.enable();
		return this.each(function() {
	    	var instanceID = $(this).attr("data-sitemap-instance-id");
			$(this).dynatree({
				autoFocus: false,
				cookieId: 'ccmsitemap',
				cookie: {
					path: CCM_REL + '/'
				},
				persist: true,
				initAjax: {
					url: CCM_TOOLS_PATH + '/dashboard/sitemap_data',
					data: {

					}
				},
				selectMode: 1,
				minExpandLevel: 2,
				clickFolderMode: 2,
				onLazyRead: function(node) {
					methods.private.reloadNode(node);
				}, 
				onClick: function(node, e) {
					if (node.getEventTargetType(event) == "title"){
						var $menu = methods.private.getMenu(instanceID, node.data);
						if ($menu) {
							$.fn.ccmmenu.showmenu(e, $menu);
						}
					}
				},
				dnd: {
					onDragStart: function(node) {
						return true;
					},
					onDragStop: function(node) {

					},
					autoExpandMS: 1000,
					preventVoidMoves: true,
					onDragEnter: function(node, sourceNode) {
						return true;
					},
					onDragOver: function(node, sourceNode, hitMode) {
						if (node.data.cID == 1) {
							return false;
						}

				        // Prevent dropping a parent below it's own child
				        if(node.isDescendantOf(sourceNode)){
				          return false;
				        }
				        return true;

					},
					onDrop: function(node, sourceNode, hitMode, ui, draggable) {
						if (node.parent.data.cID == sourceNode.parent.data.cID && hitMode != 'over') {
							// we are reordering
				        	sourceNode.move(node, hitMode);
							methods.private.rescanDisplayOrder(sourceNode.parent);
						} else {
							// we are dragging either onto a node or into another part of the site
							methods.private.selectMoveCopyTarget(instanceID, sourceNode, node, hitMode);
						}
					}
				}
			});
			
			$(this).on('deleteRequestComplete', function(e, response) {
				if (response.deferred) {
		 			ccmAlert.hud(ccmi18n_sitemap.deletePageSuccessDeferredMsg, 2000, 'delete_small', ccmi18n_sitemap.deletePage);
				} else {
		 			ccmAlert.hud(ccmi18n_sitemap.deletePageSuccessMsg, 2000, 'delete_small', ccmi18n_sitemap.deletePage);
		 			if (response.display_mode == 'explore') {
						ccmSitemapExploreNode(response.instance_id, 'explore', response.select_mode, response.cParentID);
					} else {
						var node = $('[data-sitemap-instance-id=' + response.instance_id + ']').dynatree('getActiveNode');
						var parent = node.parent;
						methods.private.reloadNode(parent);
					}
				}
			});



		});

    }


  }

  $.fn.ccmsitemap = function(method) {

    if ( methods[method] ) {
      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.ccmsitemap' );
    }   

  };
})(jQuery, window);