angular.module('KMCModule').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/additionalPlaylists.html',
    "<div class=\"text\" ng-controller=\"playlistCtrl\">\n" +
    "\t<span ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" class=\"pluginLabel\" id=\"{{property.id}}\">{{property.label}}</span>\n" +
    "\t<i class=\"glyphicon glyphicon-question-sign helpIcon\" ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" ng-show=\"{{property.helpnote != null}}\" tooltip=\"{{property.helpnote}}\" tooltip-placement=\"right\" tooltip-popup-delay=\"500\"></i><br>\n" +
    "\t<br>\n" +
    "\t<table style=\"margin-bottom: 10px\">\n" +
    "\n" +
    "\t\t<thead>\n" +
    "\t\t<tr ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" class=\"pluginLabel\">\n" +
    "\t\t\t<th>Playlist Name</th>\n" +
    "\t\t\t<th>Playlist ID</th>\n" +
    "\t\t\t<th></th>\n" +
    "\t\t</tr>\n" +
    "\t\t</thead>\n" +
    "\t\t<tbody>\n" +
    "\t\t<tr ng-repeat=\"item in additionalPlaylists\" style=\"line-height: 36px\">\n" +
    "\t\t\t<td style=\"width: 135px\"><input type=\"text\" style=\"width: 125px\" class=\"alpha\" ng-disabled=\"(plugin!=null && !plugin.enabled) || !item.editable\" on-finish-render=\"\" ng-model=\"item.name\" ng-change=\"updatePlaylist(property, false)\" ng-enter=\"updatePlaylist(property, 'enter')\" ng-blur=\"updatePlaylist(property, 'blur')\"></td>\n" +
    "\t\t\t<td style=\"width: 135px\"><input type=\"text\" style=\"width: 125px\" class=\"alpha\" ng-disabled=\"(plugin!=null && !plugin.enabled) || !item.editable\" on-finish-render=\"\" ng-model=\"item.id\" ng-change=\"updatePlaylist(property, false)\" ng-enter=\"updatePlaylist(property, 'enter')\" ng-blur=\"updatePlaylist(property, 'blur')\"></td>\n" +
    "\t\t\t<td style=\"width: 20px\" ng-if=\"plugin!=null && plugin.enabled && item.editable\"><a href=\"\" ng-click=\"deletePlaylist($index, property)\" tooltip=\"Remove Playlist\">[X]</a>\n" +
    "\t\t\t</td>\n" +
    "\t\t\t<td style=\"width: 20px\" ng-class=\"{disabled: (plugin!=null && !plugin.enabled) || !item.editable}\" ng-if=\"(plugin!=null && !plugin.enabled) || !item.editable\"><span>[X]</span></td>\n" +
    "\t\t</tr>\n" +
    "\t\t</tbody>\n" +
    "\t</table>\n" +
    "\t<a ng-if=\"plugin!=null && plugin.enabled\" href=\"\" ng-click=\"addPlaylist(property)\" tooltip=\"Add Playlist\">[add]</a>\n" +
    "\t<span ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" ng-if=\"plugin!=null && !plugin.enabled\">[add]</span>\n" +
    "\t<hr bind-once=\"\" ng-if=\"property.endline\">\n" +
    "</div>"
  );


  $templateCache.put('templates/category.html',
    "<div ng-show=\"selectedCategory==category.label\" class=\"category\">\n" +
    "\t<p class=\"categoryLabel\" bind-once=\"\">{{category.label}}</p>\n" +
    "\t<p class=\"categoryDesc\" bind-once=\"\">{{category.description}}</p>\n" +
    "\t<p class=\"loading\" ng-if=\"category.pluginsNotLoaded\"><i class=\"glyphicon glyphicon-refresh\" style=\"margin-right: 5px\"></i>Loading, please wait...</p>\n" +
    "\t<div ng-repeat=\"property in category.properties\" ng-include=\"'templates/' + property.type +'.html'\"></div>\n" +
    "\n" +
    "\t<div accordion=\"\" close-others=\"false\">\n" +
    "\t\t<div accordion-group=\"\" ng-repeat=\"plugin in category.plugins\" is-open=\"plugin.isopen\" on-finish-render=\"\">\n" +
    "\t\t\t<div accordion-heading=\"\">\n" +
    "\t\t\t\t<span id=\"{{plugin.id}}\" class=\"accHeader\">{{plugin.label}}</span><input ng-if=\"plugin.model !== 'uiVars'\" class=\"pull-right\" type=\"checkbox\" ng-model=\"plugin.enabled\" ng-click=\"togglePlugin(plugin, $event)\">\n" +
    "\t\t\t\t<i ng-class=\"{rotate90:plugin.isopen}\" class=\"glyphicon glyphicon-play accHeaderArrow\"></i>\n" +
    "\t\t\t</div>\n" +
    "\t\t\t<p bind-once=\"\" class=\"categoryDesc\" ng-bind-html=\"plugin.description\"></p>\n" +
    "\t\t\t<div ng-repeat=\"property in plugin.properties\" ng-include=\"'templates/' + property.type +'.html'\"></div>\n" +
    "\t\t</div>\n" +
    "\t</div>\n" +
    "</div>"
  );


  $templateCache.put('templates/categoryIcon.html',
    "<div ng-style=\"{'margin-top':60 * $index + 'px'}\" class=\"categoryIcon\">\n" +
    "\t<div class=\"icon icon-{{category.icon}}\" ng-class=\"{active: selectedCategory == category.label}\" ng-click=\"categorySelected(category.label)\" tooltip=\"{{category.label}}\" tooltip-placement=\"right\"></div>\n" +
    "</div>"
  );


  $templateCache.put('templates/checkbox.html',
    "<div class=\"checkbox\">\n" +
    "\t<!--span bind-once>{{property.label}}</span><br-->\n" +
    "\t<label ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" class=\"pluginLabel\" id=\"{{property.id}}\"><input type=\"checkbox\" ng-change=\"propertyChanged(property, true)\" ng-disabled=\"plugin!=null && !plugin.enabled\" ng-model=\"property.initvalue\">{{property.label}}</label>\n" +
    "\t<i class=\"glyphicon glyphicon-question-sign helpIcon\" ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" ng-show=\"{{property.helpnote != null}}\" tooltip=\"{{property.helpnote}}\" tooltip-placement=\"right\" tooltip-popup-delay=\"500\"></i>\n" +
    "\t<!--pretty-checkbox ng-disabled=\"plugin!=null && !plugin.enabled\" ng-model=\"property.initvalue\" label=\"property.label\"></pretty-checkbox-->\n" +
    "\t<hr bind-once=\"\" ng-if=\"property.endline\" style=\"margin-left: -50px;width: 380px\">\n" +
    "</div>"
  );


  $templateCache.put('templates/color.html',
    "<div class=\"color\" style=\"padding-top: 15px\">\n" +
    "\t<span ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" class=\"pluginLabel\" id=\"{{property.id}}\">{{property.label}}</span>\n" +
    "\t<i class=\"glyphicon glyphicon-question-sign helpIcon\" ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" ng-show=\"{{property.helpnote != null}}\" tooltip=\"{{property.helpnote}}\" tooltip-placement=\"right\" tooltip-popup-delay=\"500\"></i>\n" +
    "\t<spectrum-colorpicker class=\"pull-right\" ng-if=\"plugin!=null && !plugin.enabled\" options=\"{showInput: true, disabled: true, showButtons: false}\" ng-model=\"property.initvalue\"></spectrum-colorpicker>\n" +
    "\t<spectrum-colorpicker ng-change=\"propertyChanged(property, true)\" class=\"pull-right\" ng-if=\"plugin!=null && plugin.enabled\" options=\"{showInput: true, disabled: false, clickoutFiresChange: true, showButtons: false, preferredFormat: 'rgb', showAlpha: property.alpha}\" ng-model=\"property.initvalue\"></spectrum-colorpicker>\n" +
    "\t<hr bind-once=\"\" ng-if=\"property.endline\">\n" +
    "</div>"
  );


  $templateCache.put('templates/companions.html',
    "<div class=\"text\">\n" +
    "\t<span ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" class=\"pluginLabel\" id=\"{{property.id}}\">{{property.label}}</span>\n" +
    "\t<i class=\"glyphicon glyphicon-question-sign helpIcon\" ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" ng-show=\"{{property.helpnote != null}}\" tooltip=\"{{property.helpnote}}\" tooltip-placement=\"right\" tooltip-popup-delay=\"500\"></i><br>\n" +
    "\t<br><table style=\"margin-bottom: 10px\">\n" +
    "\t<thead>\n" +
    "\t<tr ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" class=\"pluginLabel\">\n" +
    "\t\t<th>Div ID</th>\n" +
    "\t\t<th>Width</th>\n" +
    "\t\t<th>Height</th>\n" +
    "\t\t<th></th>\n" +
    "\t</tr>\n" +
    "\t</thead>\n" +
    "\t<tbody>\n" +
    "\t<tr ng-repeat=\"item in property.initvalue\" style=\"line-height: 36px\">\n" +
    "\t\t<td style=\"width: 130px\"><input type=\"text\" style=\"width: 120px\" class=\"alpha\" ng-disabled=\"plugin!=null && !plugin.enabled\" on-finish-render=\"\" ng-model=\"item.label\" ng-change=\"propertyChanged(property, false)\" ng-enter=\"propertyChanged(property, 'enter')\" ng-blur=\"propertyChanged(property, 'blur')\"></td>\n" +
    "\t\t<td style=\"width: 60px\"><input type=\"text\" style=\"width: 50px\" class=\"numeric\" ng-disabled=\"plugin!=null && !plugin.enabled\" ng-model=\"item.width\" on-finish-render=\"\" ng-change=\"propertyChanged(property, false)\" ng-enter=\"propertyChanged(property, 'enter')\" ng-blur=\"propertyChanged(property, 'blur')\"></td>\n" +
    "\t\t<td style=\"width: 60px\"><input type=\"text\" style=\"width: 50px\" class=\"numeric\" ng-disabled=\"plugin!=null && !plugin.enabled\" ng-model=\"item.height\" on-finish-render=\"\" ng-change=\"propertyChanged(property, false)\" ng-enter=\"propertyChanged(property, 'enter')\" ng-blur=\"propertyChanged(property, 'blur')\"></td>\n" +
    "\t\t<td style=\"width: 20px\" ng-if=\"plugin!=null && plugin.enabled\"><a href=\"\" ng-click=\"property.initvalue.splice($index, 1);propertyChanged(property, true)\" tooltip=\"Remove companion\">[X]</a></td>\n" +
    "\t\t<td style=\"width: 20px\" ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" ng-if=\"plugin!=null && !plugin.enabled\"><span>[X]</span></td>\n" +
    "\t</tr>\n" +
    "\t</tbody>\n" +
    "</table>\n" +
    "\t<a ng-if=\"plugin!=null && plugin.enabled\" href=\"\" ng-click=\"property.initvalue.push({'label':''});propertyChanged(property, true)\" tooltip=\"Add companion\">[add]</a>\n" +
    "\t<span ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" ng-if=\"plugin!=null && !plugin.enabled\">[add]</span>\n" +
    "\t<hr bind-once=\"\" ng-if=\"property.endline\">\n" +
    "</div>"
  );


  $templateCache.put('templates/dimensions.html',
    "<div class=\"text dimensions\">\n" +
    "\t<span ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" class=\"pluginLabel\" id=\"{{property.id}}\">{{property.label}}</span>\n" +
    "\t<i class=\"glyphicon glyphicon-question-sign helpIcon\" ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" ng-show=\"{{property.helpnote != null}}\" tooltip=\"{{property.helpnote}}\" tooltip-placement=\"right\" tooltip-popup-delay=\"500\"></i>\n" +
    "\t<br><br>\n" +
    "\t<span ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" class=\"pluginLabel\">Constrain Aspect Ratio:</span>\n" +
    "\t<select ng-disabled=\"plugin!=null && !plugin.enabled\" ng-change=\"propertyChanged({'aspectRatio': aspectRatio, 'model': aspectRatio})\" ui-select2=\"{ allowClear: true, width: '175px', minimumResultsForSearch: -1}\" ng-model=\"aspectRatio\" class=\"dropdown\">\n" +
    "\t\t<option value=\"{{item.value}}\" ng-repeat=\"item in property.options\">\n" +
    "\t\t\t{{item.label}}\n" +
    "\t\t</option>\n" +
    "\t</select>\n" +
    "<br><br>\n" +
    "\t<span class=\"pluginLabel\">Width:</span><input class=\"numeric\" style=\"width: 80px; margin-left: 5px\" type=\"text\" ng-class=\"{invalid: property.invalidTooltip, allowNegative: property.allowNegative}\" ng-change=\"propertyChanged({'aspectRatio': aspectRatio, 'model': aspectRatio})\" ng-enter=\"propertyChanged({'aspectRatio': aspectRatio, 'model': aspectRatio})\" ng-disabled=\"plugin!=null && !plugin.enabled\" ng-model=\"playerData.width\" tooltip=\"{{property.invalidTooltip}}\"><span> px</span>\n" +
    "\t<div class=\"pull-right\">\n" +
    "\t\t<i class=\"icon-lock\" ng-if=\"aspectRatio != 'custom'\" style=\"margin-right: 8px; cursor: pointer\" tooltip=\"{{property.helpnote2}}\" tooltip-placement=\"right\" tooltip-popup-delay=\"500\"></i>\n" +
    "\t\t<i class=\"icon-unlock\" ng-if=\"aspectRatio == 'custom'\" style=\"margin-right: 8px\"></i>\n" +
    "\t\t<span class=\"pluginLabel\" ng-class=\"{disabled: aspectRatio != 'custom'}\">Height:</span><input class=\"numeric\" style=\"width: 80px; margin-left: 5px\" type=\"text\" ng-class=\"{invalid: property.invalidTooltip, allowNegative: property.allowNegative}\" ng-change=\"propertyChanged({'aspectRatio': aspectRatio, 'model': aspectRatio})\" ng-enter=\"propertyChanged({'aspectRatio': aspectRatio, 'model': aspectRatio})\" ng-disabled=\"aspectRatio!= 'custom'\" ng-model=\"playerData.height\" tooltip=\"{{property.invalidTooltip}}\"><span> px</span>\n" +
    "\t</div>\n" +
    "\t<hr bind-once=\"\" ng-if=\"property.endline\">\n" +
    "</div>"
  );


  $templateCache.put('templates/dropdown.html',
    "<div class=\"text dropdownContainer\">\n" +
    "\t<span ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" class=\"pluginLabel\" id=\"{{property.id}}\">{{property.label}}</span>\n" +
    "\t<i class=\"glyphicon glyphicon-question-sign helpIcon\" ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" ng-show=\"{{property.helpnote != null}}\" tooltip=\"{{property.helpnote}}\" tooltip-placement=\"right\" tooltip-popup-delay=\"500\"></i>\n" +
    "\t<select ng-disabled=\"plugin!=null && !plugin.enabled\" ng-change=\"propertyChanged(property, true)\" ui-select2=\"{ allowClear: true, width: '175px', minimumResultsForSearch: -1}\" ng-model=\"property.initvalue\" class=\"dropdown\">\n" +
    "\t\t<option value=\"{{item.value}}\" ng-repeat=\"item in property.options\">\n" +
    "\t\t\t{{item.label}}\n" +
    "\t\t</option>\n" +
    "\t</select>\n" +
    "\n" +
    "\t<hr bind-once=\"\" ng-if=\"property.endline\">\n" +
    "</div>"
  );


  $templateCache.put('templates/entrySelector.html',
    "<div class=\"entrySelector\" ng-controller=\"entrySelectorCtrl\">\n" +
    "\t<span ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" class=\"pluginLabel\" id=\"{{property.id}}\">{{property.label}}</span>\n" +
    "\t<i class=\"glyphicon glyphicon-question-sign helpIcon\" ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" ng-show=\"{{property.helpnote != null}}\" tooltip=\"{{property.helpnote}}\" tooltip-placement=\"right\" tooltip-popup-delay=\"500\"></i>\n" +
    "\t<input ui-select2=\"{{property.configObject}}\" data-placeholder=\"{{getLabel(property.initvalue, property.configObject)}}\" ng-model=\"property.initvalue\" class=\"dropdown\" ng-disabled=\"plugin!=null && !plugin.enabled\" ng-change=\"propertyChanged(property, true)\" type=\"hidden\">\n" +
    "\t<hr bind-once=\"\" ng-if=\"property.endline\" style=\"margin-top: 40px\">\n" +
    "</div>"
  );


  $templateCache.put('templates/float.html',
    "<div class=\"number\">\n" +
    "\t<span ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" class=\"pluginLabel\" id=\"{{property.id}}\">{{property.label}}</span>\n" +
    "\t<i class=\"glyphicon glyphicon-question-sign helpIcon\" ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" ng-show=\"{{property.helpnote != null}}\" tooltip=\"{{property.helpnote}}\" tooltip-placement=\"right\" tooltip-popup-delay=\"500\"></i>\n" +
    "\t<input class=\"pull-right float\" type=\"text\" ng-class=\"{invalid: property.invalidTooltip}\" name=\"num{{property.id}}\" ng-change=\"propertyChanged(property, false)\" ng-enter=\"propertyChanged(property, 'enter')\" ng-blur=\"propertyChanged(property, 'blur')\" ng-disabled=\"plugin!=null && !plugin.enabled\" ng-model=\"property.initvalue\" tooltip=\"{{property.invalidTooltip}}\">\n" +
    "\t<hr bind-once=\"\" ng-if=\"property.endline\">\n" +
    "</div>"
  );


  $templateCache.put('templates/hiddenValue.html',
    "<div>\n" +
    "\t<input type=\"hidden\" ng-model=\"property.initvalue\">\n" +
    "</div>"
  );


  $templateCache.put('templates/inputWindow.html',
    "<div class=\"modal-content\">\n" +
    "    <div class=\"modal-header\">\n" +
    "        <button type=\"button\" class=\"close\" ng-click=\"cancel()\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n" +
    "        <h4 class=\"modal-title\">{{title}}</h4>\n" +
    "    </div>\n" +
    "    <div class=\"modal-body\">\n" +
    "        <p ng-bind-html=\"message | HTMLunsafe\"></p>\n" +
    "\t    <input type=\"text\" class=\"userInput\" ng-style=\"inputStyle\" ng-model=\"userInput\">\n" +
    "    </div>\n" +
    "    <div class=\"modal-footer\">\n" +
    "        <button ng-repeat=\"btn in buttons\" ng-click=\"close(btn.result)\" class=\"btn\" ng-class=\"btn.cssClass\">{{ btn.label}}</button>\n" +
    "    </div>\n" +
    "</div>"
  );


  $templateCache.put('templates/json.html',
    "<div class=\"text\" ng-controller=\"jsonCtrl\">\n" +
    "\t<span class=\"pluginLabel\" ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" id=\"{{property.id}}\">{{property.label}}</span>\n" +
    "\t<i class=\"glyphicon glyphicon-question-sign helpIcon\" ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" ng-show=\"{{property.helpnote != null}}\" tooltip-html-unsafe=\"{{property.helpnote}}\" tooltip-placement=\"right\" tooltip-popup-delay=\"500\"></i><br>\n" +
    "\t<!--textarea type=\"text\" ng-class=\"{invalid: property.invalidTooltip}\"  tooltip=\"{{property.invalidTooltip}}\" tooltip-placement=\"top\" tooltip-popup-delay=\"0\" ng-model=\"property.initvalue\" ng-change=\"propertyChanged(property, false)\" ng-enter=\"propertyChanged(property, 'enter')\" ng-blur=\"propertyChanged(property, 'blur')\" ng-disabled=\"plugin!=null && !plugin.enabled\"></textarea-->\n" +
    "\t<div class=\"jsonView\">\n" +
    "\t\t<div ng-hide=\"plugin!=null && !plugin.enabled\">\n" +
    "\t\t\t<json child=\"property.initvalue\" default-collapsed=\"true\" allow-complex-types=\"property.allowComplexTypes\" type=\"object\"></json>\n" +
    "\t\t</div>\n" +
    "\t\t<span ng-class=\"{disabled: true}\" ng-show=\"plugin!=null && !plugin.enabled\">Please enable the plugin to edit this property</span>\n" +
    "\t</div>\n" +
    "\t<hr bind-once=\"\" ng-if=\"property.endline\">\n" +
    "</div>"
  );


  $templateCache.put('templates/keyValuePairs.html',
    "<div class=\"text\" ng-controller=\"keyValuePairsCtrl\">\n" +
    "\t<span ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" class=\"pluginLabel\" id=\"{{property.id}}\">{{property.label}}</span>\n" +
    "\t<i class=\"glyphicon glyphicon-question-sign helpIcon\" ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" ng-show=\"{{property.helpnote != null}}\" tooltip=\"{{property.helpnote}}\" tooltip-placement=\"right\" tooltip-popup-delay=\"500\"></i><br>\n" +
    "\t<br><table style=\"margin-bottom: 10px\">\n" +
    "\t\t<thead>\n" +
    "\t\t\t<tr class=\"pluginLabel\" ng-show=\"keyValuePairs.length\">\n" +
    "\t\t\t\t<th>Key</th>\n" +
    "\t\t\t\t<th>Value</th>\n" +
    "\t\t\t\t<th></th>\n" +
    "\t\t\t</tr>\n" +
    "\t\t</thead>\n" +
    "\t\t<tbody>\n" +
    "\t\t\t<tr ng-repeat=\"item in keyValuePairs\" style=\"line-height: 36px\">\n" +
    "\t\t\t\t<td style=\"width: 140px\"><input type=\"text\" style=\"width: 120px\" on-finish-render=\"\" ng-model=\"item.key\" ng-change=\"updateData(); propertyChanged(property, false)\" ng-enter=\"updateData(); propertyChanged(property, 'enter')\" ng-blur=\"updateData(); propertyChanged(property, 'blur')\" ng-class=\"{disabled: plugin!=null && !plugin.enabled}\"></td>\n" +
    "\t\t\t\t<td style=\"width: 140px\"><input type=\"text\" style=\"width: 120px\" on-finish-render=\"\" ng-model=\"item.value\" ng-change=\"updateData(); propertyChanged(property, false)\" ng-enter=\"updateData(); propertyChanged(property, 'enter')\" ng-blur=\"updateData(); propertyChanged(property, 'blur')\" ng-class=\"{disabled: plugin!=null && !plugin.enabled}\"></td>\n" +
    "\t\t\t\t<td style=\"width: 20px\"><a href=\"\" ng-click=\"keyValuePairs.splice($index, 1);updateData();propertyChanged(property, true)\" tooltip=\"Remove key\">[X]</a></td>\n" +
    "\t\t\t</tr>\n" +
    "\t\t</tbody>\n" +
    "\t</table>\n" +
    "\t<a href=\"\" ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" ng-click=\"keyValuePairs.push({'key':'', 'value':''});updateData();propertyChanged(property, true)\" tooltip=\"Add a new key\">[add]</a>\n" +
    "\t<hr bind-once=\"\" ng-if=\"property.endline\">\n" +
    "</div>"
  );


  $templateCache.put('templates/message.html',
    "<div class=\"modal-content\">\n" +
    "    <div class=\"modal-header\">\n" +
    "        <button type=\"button\" class=\"close\" ng-click=\"cancel()\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n" +
    "        <h4 class=\"modal-title\">{{title}}</h4>\n" +
    "    </div>\n" +
    "    <div class=\"modal-body\">\n" +
    "        <p ng-bind-html=\"message | HTMLunsafe\"></p>\n" +
    "    </div>\n" +
    "    <div class=\"modal-footer\">\n" +
    "        <button ng-repeat=\"btn in buttons\" ng-click=\"close(btn.result)\" class=\"btn\" ng-class=\"btn.cssClass\">{{ btn.label}}</button>\n" +
    "    </div>\n" +
    "</div>"
  );


  $templateCache.put('templates/number.html',
    "<div class=\"number\">\n" +
    "\t<span ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" class=\"pluginLabel\" id=\"{{property.id}}\">{{property.label}}</span>\n" +
    "\t<i class=\"glyphicon glyphicon-question-sign helpIcon\" ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" ng-show=\"{{property.helpnote != null}}\" tooltip=\"{{property.helpnote}}\" tooltip-placement=\"right\" tooltip-popup-delay=\"500\"></i>\n" +
    "\t<input class=\"pull-right numeric\" type=\"text\" ng-class=\"{invalid: property.invalidTooltip, allowNegative: property.allowNegative}\" name=\"num{{property.id}}\" ng-change=\"propertyChanged(property, false)\" ng-enter=\"propertyChanged(property, 'enter')\" ng-blur=\"propertyChanged(property, 'blur')\" ng-disabled=\"plugin!=null && !plugin.enabled\" ng-model=\"property.initvalue\" tooltip=\"{{property.invalidTooltip}}\">\n" +
    "\t<hr bind-once=\"\" ng-if=\"property.endline\">\n" +
    "</div>"
  );


  $templateCache.put('templates/numbersArray.html',
    "<div class=\"text\">\n" +
    "\t<span class=\"pluginLabel\" ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" id=\"{{property.id}}\">{{property.label}}</span>\n" +
    "\t<i class=\"glyphicon glyphicon-question-sign helpIcon\" ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" ng-show=\"{{property.helpnote != null}}\" tooltip-html-unsafe=\"{{property.helpnote}}\" tooltip-placement=\"right\" tooltip-popup-delay=\"500\"></i><br>\n" +
    "\t<input type=\"text\" class=\"numbersArray\" ng-class=\"{invalid: property.invalidTooltip}\" tooltip=\"{{property.invalidTooltip}}\" tooltip-placement=\"top\" tooltip-popup-delay=\"0\" ng-model=\"property.initvalue\" ng-change=\"propertyChanged(property, false)\" ng-enter=\"propertyChanged(property, 'enter')\" ng-blur=\"propertyChanged(property, 'blur')\" ng-disabled=\"plugin!=null && !plugin.enabled\">\n" +
    "\t<hr bind-once=\"\" ng-if=\"property.endline\">\n" +
    "</div>"
  );


  $templateCache.put('templates/readonly.html',
    "<div class=\"text\" on-finish-render=\"\">\n" +
    "\t<span bind-once=\"\" class=\"pluginLabel\" id=\"{{property.id}}\">{{property.label}}</span>\n" +
    "\t<i class=\"glyphicon glyphicon-question-sign helpIcon\" ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" ng-show=\"{{property.helpnote != null}}\" tooltip=\"{{property.helpnote}}\" tooltip-placement=\"right\" tooltip-popup-delay=\"500\"></i>\n" +
    "\t<span ng-show=\"{{property.filter == null}}\" nbind-once=\"\" class=\"readonly\">{{property.initvalue}}</span>\n" +
    "\t<span ng-show=\"{{property.filter == 'timeago'}}\" bind-once=\"\" class=\"readonly\">{{property.initvalue|timeago}}</span>\n" +
    "\t<hr bind-once=\"\" ng-if=\"property.endline\">\n" +
    "</div>"
  );


  $templateCache.put('templates/related.html',
    "<div class=\"text\" style=\"height: 115px\" ng-controller=\"relatedCtrl\">\n" +
    "\t<span class=\"pluginLabel\" ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" id=\"{{property.id}}\">{{property.label}}</span>\n" +
    "\t<i class=\"glyphicon glyphicon-question-sign helpIcon\" ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" ng-show=\"{{property.helpnote != null}}\" tooltip-html-unsafe=\"{{property.helpnote}}\" tooltip-placement=\"right\" tooltip-popup-delay=\"500\"></i><br>\n" +
    "\t<div class=\"btn-group\" style=\"margin-bottom: 5px; margin-top: 5px; width: 100%\">\n" +
    "\t\t<label class=\"btn btn-default btn-sm\" ng-model=\"relatedOption\" btn-radio=\"'relatedToEntry'\" ng-click=\"relatedSelected()\">Related to Entry</label>\n" +
    "\t\t<label class=\"btn btn-default btn-sm\" ng-model=\"relatedOption\" btn-radio=\"'playlistId'\">Playlist ID</label>\n" +
    "\t\t<label class=\"btn btn-default btn-sm\" ng-model=\"relatedOption\" btn-radio=\"'entryList'\">Entries List</label>\n" +
    "\t</div>\n" +
    "\t<span class=\"featureDesc\" ng-show=\"relatedOption=='relatedToEntry'\">Entries related to the current entry will be displayed.<br>If there are no related entries, the plugin is disabled.</span>\n" +
    "\n" +
    "\t<span class=\"featureDesc\" ng-show=\"relatedOption=='playlistId'\">Select Playlist:</span>\n" +
    "\t<input ng-show=\"relatedOption=='playlistId'\" ui-select2=\"{{property.configObject}}\" data-placeholder=\"{{getLabel(playlistId, property.configObject)}}\" ng-model=\"playlistId\" class=\"dropdown\" ng-disabled=\"plugin!=null && !plugin.enabled\" ng-change=\"playlistIdChange();propertyChanged(property, true)\" type=\"hidden\">\n" +
    "\n" +
    "\t<span class=\"featureDesc\" ng-show=\"relatedOption=='entryList'\">Please enter a comma delimited list of entries:</span>\n" +
    "\t<input type=\"text\" class=\"alpha\" ng-show=\"relatedOption=='entryList'\" ng-model=\"entryList\" ng-change=\"entryListChange();propertyChanged(property, false)\" ng-enter=\"entryListChange();propertyChanged(property, 'enter')\" ng-blur=\"entryListChange();propertyChanged(property, 'blur')\" ng-disabled=\"plugin!=null && !plugin.enabled\">\n" +
    "</div>"
  );


  $templateCache.put('templates/search.html',
    "<div class=\"text\">\n" +
    "\t<input type=\"text\" id=\"searchField\" ng-show=\"menuLoaded\" onfocus=\"$(this).val('')\" typeahead-on-select=\"searchProperty($item, $model, $label)\" ng-model=\"propertyToSearch\" typeahead=\"prop as prop.label for prop in propertiesSearch | filter:$viewValue | limitTo:8\" class=\"form-control\">\n" +
    "\t<p ng-hide=\"menuLoaded\" class=\"loading\"><i class=\"glyphicon glyphicon-refresh\" style=\"margin-right: 5px\"></i>Indexing, please wait...</p>\n" +
    "</div>"
  );


  $templateCache.put('templates/select2data.html',
    "<div class=\"text\">\n" +
    "\t<span ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" class=\"pluginLabel\" id=\"{{property.id}}\">{{property.label}}</span>\n" +
    "\t<i class=\"glyphicon glyphicon-question-sign helpIcon\" ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" ng-show=\"{{property.helpnote != null}}\" tooltip=\"{{property.helpnote}}\" tooltip-placement=\"right\" tooltip-popup-delay=\"500\"></i>\n" +
    "\t<div class=\"btn-group pull-right\" style=\"margin-bottom: 10px\">\n" +
    "\t\t<label class=\"btn btn-default\" ng-model=\"entriesTypeSelector\" btn-radio=\"'Entries'\" ng-click=\"setEntriesType('Entries')\">Entries</label>\n" +
    "\t\t<label class=\"btn btn-default\" ng-model=\"entriesTypeSelector\" btn-radio=\"'Playlist'\" ng-click=\"setEntriesType('Playlist')\">Playlist</label>\n" +
    "\t</div>\n" +
    "\t<input ng-if=\"entriesTypeSelector=='Entries'\" ui-select2=\"entriesSelectBox\" ng-model=\"selectedEntry\" class=\"dropdown\" ng-disabled=\"plugin!=null && !plugin.enabled\" ng-change=\"propertyChanged({'selectedEntry': selectedEntry, 'model': property.model})\" type=\"hidden\">\n" +
    "\t<input ng-if=\"entriesTypeSelector=='Playlist'\" ui-select2=\"playlistSelectBox\" ng-model=\"selectedEntry\" class=\"dropdown\" ng-disabled=\"plugin!=null && !plugin.enabled\" ng-change=\"propertyChanged({'selectedEntry': selectedEntry, 'model': property.model})\" type=\"hidden\">\n" +
    "\t<hr bind-once=\"\" ng-if=\"property.endline\" style=\"margin-top: 70px\">\n" +
    "</div>"
  );


  $templateCache.put('templates/tabs.html',
    "<div class=\"text\">\n" +
    "\n" +
    "\t<div tabset=\"\">\n" +
    "\t\t<div tab=\"\" ng-repeat=\"tab in property.children\" heading=\"{{tab.label}}\" active=\"tab.active\" class=\"tabHeader\" disabled=\"plugin!=null && !plugin.enabled\">\n" +
    "\t\t\t<div ng-repeat=\"property in tab.children\" ng-include=\"'templates/' + property.type +'.html'\"></div>\n" +
    "\t\t</div>\n" +
    "\t</div>\n" +
    "\n" +
    "\t<hr bind-once=\"\" ng-if=\"property.endline\">\n" +
    "</div>"
  );


  $templateCache.put('templates/text.html',
    "<div class=\"text\" ng-class=\"{sm: property.size=='small'}\">\n" +
    "\t<span class=\"pluginLabel\" ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" id=\"{{property.id}}\">{{property.label}}</span>\n" +
    "\t<i class=\"glyphicon glyphicon-question-sign helpIcon\" ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" ng-show=\"{{property.helpnote != null}}\" tooltip-html-unsafe=\"{{property.helpnote}}\" tooltip-placement=\"right\" tooltip-popup-delay=\"500\"></i>\n" +
    "    <br ng-if=\"property.size==small\">\n" +
    "\t<input type=\"text\" class=\"alpha\" ng-class=\"{invalid: property.invalidTooltip}\" tooltip=\"{{property.invalidTooltip}}\" tooltip-placement=\"top\" tooltip-popup-delay=\"0\" ng-model=\"property.initvalue\" ng-change=\"propertyChanged(property, false)\" ng-enter=\"propertyChanged(property, 'enter')\" ng-blur=\"propertyChanged(property, 'blur')\" ng-disabled=\"plugin!=null && !plugin.enabled\">\n" +
    "\t<hr bind-once=\"\" ng-if=\"property.endline\">\n" +
    "</div>"
  );


  $templateCache.put('templates/uivars.html',
    "<div class=\"text\">\n" +
    "\t<span ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" class=\"pluginLabel\" id=\"{{property.id}}\">{{property.label}}</span>\n" +
    "\t<i class=\"glyphicon glyphicon-question-sign helpIcon\" ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" ng-show=\"{{property.helpnote != null}}\" tooltip=\"{{property.helpnote}}\" tooltip-placement=\"right\" tooltip-popup-delay=\"500\"></i><br>\n" +
    "\t<!--ul style=\"padding-left: 15px; margin-top: 15px\">\n" +
    "\t\t<li ng-repeat=\"item in property.initvalue\" style=\"padding-top: 5px\">\n" +
    "\t\t\t<span class=\"categoryDesc\" ng-class=\"{disabled: plugin!=null && !plugin.enabled}\">Key:&nbsp;<input type=\"text\" class=\"alpha\" on-finish-render ng-model=\"item.label\" style=\"width: 140px\" ng-disabled=\"plugin!=null && !plugin.enabled\" ng-change=\"propertyChanged(property, false)\" ng-enter=\"propertyChanged(property, 'enter')\" ng-blur=\"propertyChanged(property, 'blur')\">&nbsp;Value:&nbsp;<input type=\"text\" ng-model=\"item.value\" on-finish-render style=\"width: 50px\" ng-disabled=\"plugin!=null && !plugin.enabled\" ng-change=\"propertyChanged(property, false)\" ng-enter=\"propertyChanged(property, 'enter')\" ng-blur=\"propertyChanged(property, 'blur')\">\n" +
    "\t\t\t<a href ng-click=\"property.initvalue.splice($index, 1);propertyChanged(property, true)\" tooltip=\"Remove variable\">&nbsp;[X]</a></span>\n" +
    "\t\t</li>\n" +
    "\t\t<li>\n" +
    "\t\t\t<a href ng-click=\"property.initvalue.push({'label':''});propertyChanged(property, true)\" tooltip=\"Add a new variable\">[add]</a>\n" +
    "\t\t</li>\n" +
    "\t</ul-->\n" +
    "\t<br><table style=\"margin-bottom: 10px\">\n" +
    "\t\t<thead>\n" +
    "\t\t\t<tr class=\"pluginLabel\" ng-show=\"property.initvalue.length\">\n" +
    "\t\t\t\t<th>Key</th>\n" +
    "\t\t\t\t<th>Value</th>\n" +
    "\t\t\t\t<th></th>\n" +
    "\t\t\t</tr>\n" +
    "\t\t</thead>\n" +
    "\t\t<tbody>\n" +
    "\t\t\t<tr ng-repeat=\"item in property.initvalue\" style=\"line-height: 36px\">\n" +
    "\t\t\t\t<td style=\"width: 180px\"><input type=\"text\" style=\"width: 160px\" class=\"alpha\" on-finish-render=\"\" ng-model=\"item.label\" ng-change=\"propertyChanged(property, false)\" ng-enter=\"propertyChanged(property, 'enter')\" ng-blur=\"propertyChanged(property, 'blur')\"></td>\n" +
    "\t\t\t\t<td style=\"width: 90px\"><input type=\"text\" style=\"width: 80px\" ng-model=\"item.value\" on-finish-render=\"\" ng-change=\"propertyChanged(property, false)\" ng-enter=\"propertyChanged(property, 'enter')\" ng-blur=\"propertyChanged(property, 'blur')\"></td>\n" +
    "\t\t\t\t<td style=\"width: 20px\"><a href=\"\" ng-click=\"property.initvalue.splice($index, 1);propertyChanged(property, true)\" tooltip=\"Remove variable\">[X]</a></td>\n" +
    "\t\t\t</tr>\n" +
    "\t\t</tbody>\n" +
    "\t</table>\n" +
    "\t<a href=\"\" ng-click=\"property.initvalue.push({'label':''});propertyChanged(property, true)\" tooltip=\"Add a new variable\">[add]</a>\n" +
    "\t<hr bind-once=\"\" ng-if=\"property.endline\">\n" +
    "</div>"
  );


  $templateCache.put('templates/url.html',
    "<div class=\"text\">\n" +
    "\t<span ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" class=\"pluginLabel\" id=\"{{property.id}}\">{{property.label}}</span>\n" +
    "\t<i class=\"glyphicon glyphicon-question-sign helpIcon\" ng-class=\"{disabled: plugin!=null && !plugin.enabled}\" ng-show=\"{{property.helpnote != null}}\" tooltip=\"{{property.helpnote}}\" tooltip-placement=\"right\" tooltip-popup-delay=\"500\"></i><br>\n" +
    "\t<input type=\"url\" class=\"alpha\" ng-class=\"{invalid: property.invalidTooltip}\" tooltip=\"{{property.invalidTooltip}}\" tooltip-placement=\"top\" tooltip-popup-delay=\"0\" ng-change=\"propertyChanged(property)\" ng-enter=\"propertyChanged(property, 'enter')\" ng-blur=\"propertyChanged(property, 'blur')\" ng-disabled=\"plugin!=null && !plugin.enabled\" ng-model=\"property.initvalue\" placeholder=\"URL\">\n" +
    "\t<hr bind-once=\"\" ng-if=\"property.endline\">\n" +
    "</div>"
  );


  $templateCache.put('view/edit.html',
    "<div style=\"height: 100%\">\r" +
    "\t<form name=\"menuForm\">\r" +
    "\t\t<div class=\"menu\" ng-style=\"menuOpen ? {'width': 440 +'px'} : {'width': 10 + 'px'}\">\r" +
    "\t\t\t<div ng-repeat=\"category in menuData\" ng-include=\"'templates/category.html'\"></div>\r" +
    "\t\t\t<div class=\"categories\">\r" +
    "\t\t\t\t<div ng-repeat=\"category in menuData\" ng-include=\"'templates/categoryIcon.html'\"></div>\r" +
    "\t\t\t</div>\r" +
    "\t\t\t<div class=\"menuFooter\"></div>\r" +
    "\t\t</div>\r" +
    "\t\t<div class=\"toggleMenu\" ng-click=\"toggleMenu()\" ng-style=\"menuOpen ? {'left': 439 +'px'} : {'left': 10 + 'px'}\">\r" +
    "\t\t\t<i ng-class=\"{'icon-Close': menuOpen,'icon-open': !menuOpen}\"></i>\r" +
    "\t\t</div>\r" +
    "\t</form>\r" +
    "\t<div class=\"previewArea\" ng-style=\"menuOpen ? {'margin-left': 490 +'px'} : {'margin-left': 50 + 'px'}\">\r" +
    "\t\t<div style=\"width: 100%; height: 40px\">\r" +
    "\t\t\t<div style=\"height: 30px; position: fixed; padding-top: 5px\">\r" +
    "\t\t\t\t<label style=\"font-weight: normal\" class=\"autoPreview\"><input style=\"margin-right: 5px\" type=\"checkbox\" ng-model=\"autoPreview\" ng-click=\"setAutoPreview()\">Auto Preview</label>\r" +
    "\t\t\t\t<label style=\"font-weight: normal\" class=\"autoPreview\"><input style=\"margin-right: 5px;margin-left: 5px\" type=\"checkbox\" ng-model=\"simulateMobile\" ng-click=\"setSimulateMobile()\">Simulate Mobile Device</label>\r" +
    "\t\t\t</div>\r" +
    "\t\t\t<button class=\"btn btn-default\" style=\"margin-left: 290px\" ng-hide=\"autoPreview\" ng-class=\"{'btn-success':checkPlayerRefresh()}\" ng-click=\"refreshPlayer()\"><i class=\"glyphicon glyphicon-refresh\">&nbsp;</i>Preview Changes</button>\r" +
    "\t\t\t<button class=\"btn btn-primary pull-right spaceLeft\" ng-click=\"save()\">Save Player Settings</button>\r" +
    "\t\t\t<button class=\"btn btn-default pull-right\" ng-click=\"backToList()\">Back to Players List</button>\r" +
    "\t\t</div>\r" +
    "\t\t<!--pre id=\"debugger\" style=\"margin-top: 10px; width: 100%; height: 500px; display: none\">{{menuData}}</pre-->\r" +
    "\t\t<div style=\"height: 85%;  margin-top: 15px; margin-bottom: 15px; overflow-y: auto\">\r" +
    "\t\t\t<!-- Companion placeholders for VAST -->\r" +
    "\t\t\t<div id=\"Comp_300x250\"></div>\r" +
    "\t\t\t<div id=\"Comp_728x90\"></div>\r" +
    "\r" +
    "\t\t\t<div id=\"kVideoTarget\" style=\"margin: auto\" itemprop=\"video\" itemscope=\"\" itemtype=\"http://schema.org/VideoObject\"></div>\r" +
    "\t\t</div>\r" +
    "\t</div>\r" +
    "</div>"
  );


  $templateCache.put('view/list.html',
    "<div class=\"fluid-container fullheight\">\n" +
    "\t<div id=\"wrapper\">\n" +
    "\t\t<div id=\"header\">\n" +
    "\t\t\t<h2 id=\"pageHeader\">\n" +
    "\t\t\t\t{{(title) ? title : \"Players list\"}}\n" +
    "\t\t\t</h2>\n" +
    "\t\t\t<small ng-hide=\"showSubTitle\">\n" +
    "\t\t\t\t{{'In this page you can customize the look and the functionality of your players'| translate}}\n" +
    "\t\t\t</small>\n" +
    "\t\t\t<div class=\"padTop clearfix\">\n" +
    "\t\t\t\t<div class=\"pull-right\">\n" +
    "\t\t\t\t\t<button type=\"button\" class=\"btn btn-primary\" data-ng-click=\"newPlayer()\"><i class=\"glyphicon glyphicon-plus\">&nbsp;</i>{{'Add New player'| translate}}\n" +
    "\t\t\t\t\t</button>\n" +
    "\t\t\t\t</div>\n" +
    "\t\t\t\t<div class=\"noPadding col-xs-5\">\n" +
    "\t\t\t\t\t<form class=\"form-inline\" id=\"listsearch\" role=\"search\">\n" +
    "\t\t\t\t\t\t<div class=\"input-group merged\">\n" +
    "                            <span class=\"input-group-addon\">\n" +
    "                                 <i class=\"icon-TabSearch\"></i>\n" +
    "                            </span>\n" +
    "\t\t\t\t\t\t\t<input type=\"text\" typeahead=\"player.name for player in data | filter:$viewValue | limitTo:8\" class=\"form-control\" placeholder=\"{{'Search by name or id'| translate}}\" ng-model=\"search\" style=\"height: 34px\">\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\n" +
    "\t\t\t\t\t</form>\n" +
    "\t\t\t\t</div>\n" +
    "\t\t\t</div>\n" +
    "\t\t</div>\n" +
    "\t\t<div id=\"playerList\" class=\"scrollerWrap maxViewPort\">\n" +
    "\t\t\t<div class=\"row\" id=\"tableHead\" notselectable=\"true\">\n" +
    "\t\t\t\t<!--div class=\"pull-left playerThumbWrapper\">{{'Preview'| translate }}</div-->\n" +
    "\t\t\t\t<div class=\"col-xs-3\"><a data-ng-click=\"sortBy('name')\"> {{ 'Name' | translate }}\n" +
    "\t\t\t\t\t<i class=\"glyphicon\" ng-class=\"{'glyphicon-chevron-down':(sort.sortCol=='name' && sort.reverse==false),\n" +
    "                'glyphicon-chevron-up':(sort.sortCol=='name' && sort.reverse == true)}\" style=\"margin-left: 5px\"></i>\n" +
    "\t\t\t\t</a>\n" +
    "\t\t\t\t</div>\n" +
    "\t\t\t\t<div class=\"idCol pull-left text-center\">{{ 'ID' | translate }}</div>\n" +
    "\t\t\t\t<div class=\"col-xs-2 text-center\"><a data-ng-click=\"sortBy('updatedAt')\"> {{ 'Save Date' | translate }}\n" +
    "\t\t\t\t\t<i class=\"glyphicon\" ng-class=\"{'glyphicon-chevron-down':(sort.sortCol=='updatedAt' && sort.reverse==false),\n" +
    "                'glyphicon-chevron-up':(sort.sortCol=='updatedAt' && sort.reverse == true)}\" style=\"margin-left: 5px\"></i>\n" +
    "\t\t\t\t</a></div>\n" +
    "\t\t\t\t<div class=\"col-lg-2 text-center visible-lg\"><a data-ng-click=\"sortBy('createdAt')\">{{ 'Creation Date' | translate }}\n" +
    "\t\t\t\t\t<i class=\"glyphicon\" ng-class=\"{'glyphicon-chevron-down':(sort.sortCol=='createdAt' && sort.reverse==false),\n" +
    "                'glyphicon-chevron-up':(sort.sortCol=='createdAt' && sort.reverse == true)}\" style=\"margin-left: 5px\"></i>\n" +
    "\t\t\t\t</a></div>\n" +
    "\t\t\t\t<div class=\"pull-left\">{{ 'Actions' | translate }}\n" +
    "\t\t\t\t</div>\n" +
    "\t\t\t</div>\n" +
    "\t\t\t<div class=\"scroller\" mcustom-scrollbar=\"{autoHideScrollbar:false}\">\n" +
    "\t\t\t\t<table id=\"listTable\">\n" +
    "\t\t\t\t\t<tbody>\n" +
    "\t\t\t\t\t<tr class=\"row repeat-animation\" on-finish-render=\"\" ng-repeat=\"item in filtered =  (data| filter:search) | startFrom:(currentPage - 1) * maxSize | limitTo:maxSize | orderBy:sort.sortCol:sort.reverse  track by item.id\">\n" +
    "\t\t\t\t\t\t<!--td class=\" playerThumbWrapper\">\n" +
    "\t\t\t\t\t\t\t<img class=\"playerThumb\" ng-src=\"{{getThumbnail(item)}}\"/>\n" +
    "\t\t\t\t\t\t</td-->\n" +
    "\t\t\t\t\t\t<td class=\"col-xs-3\"><a data-ng-click=\"goToEditPage(item,$event)\" ng-href=\"edit/{{item.id}}\">{{item.name}}</a>\n" +
    "\n" +
    "\t\t\t\t\t\t\t<div class=\"alertsWrapper\">\n" +
    "\t                            <span class=\"alert alert-warning\" ng-show=\"checkVersionNeedsUpgrade(item)\">\n" +
    "\t                                <small>{{'This player requires upgrade'| translate}}</small>\n" +
    "\t                            </span>\n" +
    "\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t</td>\n" +
    "\t\t\t\t\t\t<td class=\"idCol\">{{item.id}}</td>\n" +
    "\t\t\t\t\t\t<td class=\"col-xs-2 text-center\"><span>{{item.updatedAt | timeago}}</span></td>\n" +
    "\t\t\t\t\t\t<td class=\"visible-lg col-lg-2 text-center\"><span>{{item.createdAt | timeago }}</span></td>\n" +
    "\t\t\t\t\t\t<td class=\"actionBtns\">\n" +
    "\t\t\t\t\t\t\t<div class=\"inner\">\n" +
    "\t\t\t\t\t\t\t\t<button type=\"button\" class=\"btn btn-link\" ng-click=\"duplicate(item)\"><span class=\"icon-copy\"></span> {{'Duplicate'| translate}}\n" +
    "\t\t\t\t\t\t\t\t</button>\n" +
    "\t\t\t\t\t\t\t\t<button type=\"button\" class=\"btn btn-link\" ng-click=\"deletePlayer(item)\"><span class=\"glyphicon glyphicon-remove\"></span> {{'Delete'| translate}}\n" +
    "\t\t\t\t\t\t\t\t</button>\n" +
    "\t\t\t\t\t\t\t\t<button type=\"button\" class=\"btn btn-link\" ng-show=\"checkVersionNeedsUpgrade(item)\" ng-click=\"update(item)\"><span class=\"glyphicon glyphicon-arrow-up\"></span>\n" +
    "\t\t\t\t\t\t\t\t\t{{'Upgrade'|\n" +
    "\t\t\t\t\t\t\t\t\ttranslate}}\n" +
    "\t\t\t\t\t\t\t\t</button>\n" +
    "\t\t\t\t\t\t\t\t<button type=\"button\" class=\"btn btn-link\" ng-show=\"checkV2Upgrade(item)\" ng-click=\"upgrade(item)\"><span class=\"glyphicon glyphicon-refresh\"></span>\n" +
    "\t\t\t\t\t\t\t\t\t{{'Update'|\n" +
    "\t\t\t\t\t\t\t\t\ttranslate}}\n" +
    "\t\t\t\t\t\t\t\t</button>\n" +
    "\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t</td>\n" +
    "\t\t\t\t\t</tr>\n" +
    "\t\t\t\t\t</tbody>\n" +
    "\t\t\t\t</table>\n" +
    "\t\t\t</div>\n" +
    "\t\t\t<div id=\"footer\" class=\"text-center\">\n" +
    "\t\t\t\t<div id=\"paginationWrap\">\n" +
    "\t\t\t\t\t<pagination ng-show=\"filtered.length > maxSize\" ng-click=\"triggerLayoutChange()\" previous-text=\"&laquo;\" next-text=\"&raquo;\" page=\"currentPage\" total-items=\"filtered.length\" items-per-page=\"maxSize\"></pagination>\n" +
    "\t\t\t\t</div>\n" +
    "\t\t\t\t<div id=\"maxSizeSelect\">\n" +
    "\t\t\t\t\t<form class=\"form-inline\" role=\"form\">\n" +
    "\t\t\t\t\t\t<div>\n" +
    "\t\t\t\t\t\t\t<small style=\"margin-right: 5px\"> {{filtered.length}} Players in total, Show</small>\n" +
    "\t\t\t\t\t\t\t<select ui-select2=\"uiSelectOpts\" ng-model=\"maxSize\">\n" +
    "\t\t\t\t\t\t\t\t<option value=\"5\">5</option>\n" +
    "\t\t\t\t\t\t\t\t<option value=\"10\">10</option>\n" +
    "\t\t\t\t\t\t\t\t<option value=\"15\">15</option>\n" +
    "\t\t\t\t\t\t\t\t<option value=\"20\">20</option>\n" +
    "\t\t\t\t\t\t\t</select>\n" +
    "\t\t\t\t\t\t\t<small style=\"margin-left: 5px\">per page</small>\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t</form>\n" +
    "\t\t\t\t</div>\n" +
    "\t\t\t</div>\n" +
    "\t\t</div>\n" +
    "\t</div>\n" +
    "</div>"
  );


  $templateCache.put('view/login.html',
    "<div class=\"jumbotron fullheight\">\n" +
    "    <div class=\"container\">\n" +
    "        <div id=\"loginBox\" class=\"\">\n" +
    "            <h2 class=\"text-muted page-header\" id=\"pageHeader\">\n" +
    "                Login to v2.0 Studio\n" +
    "            </h2>\n" +
    "\n" +
    "            <div class=\"alert alert-danger\" ng-show=\"formError\">{{formHelpMsg}}</div>\n" +
    "            <form ng-submit=\"login()\" class=\"form-horizontal\">\n" +
    "                <div id=\"loginTable\">\n" +
    "\n" +
    "                    <div class=\"form-group\">\n" +
    "                        <label class=\"sr-only control-label\" for=\"email\">Email:</label>\n" +
    "                        <input class=\"form-control col-md-8\" value=\"\" type=\"text\" id=\"email\" ng-model=\"email\" placeholder=\"Email:\">\n" +
    "                    </div>\n" +
    "                    <div class=\"form-group\">\n" +
    "                        <label class=\"sr-only control-label\" for=\"password\">Password:</label>\n" +
    "                        <input class=\"form-control col-md-8\" value=\"\" type=\"password\" id=\"password\" ng-model=\"pwd\" placeholder=\"Password:\">\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"col-md-offset-4 login-foot\">\n" +
    "                        <input type=\"submit\" class=\"btn btn-primary login\" value=\"Login\"></div>\n" +
    "                </div>\n" +
    "            </form>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>"
  );


  $templateCache.put('view/new-template.html',
    "<div class=\"jumbotron\">\n" +
    "    <h2 class=\"inline text-muted\" id=\"pageHeader\">\n" +
    "        {{title}}\n" +
    "    </h2>\n" +
    "</div>\n" +
    "<div class=\"container\">\n" +
    "    <p><label> Please choose type of template : <select ui-select2=\"{minimumResultsForSearch:-1}\" ng-model=\"templateType\">\n" +
    "        <option selected=\"selected\" value=\"system\">Public Templates</option>\n" +
    "        <option value=\"user\">My Templates</option>\n" +
    "    </select>\n" +
    "    </label> <img src=\"../bower_components/select2/select2-spinner.gif\" ng-show=\"loading\">\n" +
    "    </p>\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"col-xs-4\" ng-repeat=\"player in templates\">\n" +
    "            <a class=\"playerTemplate\" ng-href=\"edit/{{player.id}}\">\n" +
    "                <h5>{{player.settings.name}}</h5>\n" +
    "\n" +
    "                <div class=\"thumbWrapper\">\n" +
    "                    <img tooltip-html-unsafe=\"{{makeTooltip($index)|translate}}\" class=\"playerThumb\" src=\"{{player.thumbnailUrl}}\" data-tooltip-placement=\"top\">\n" +
    "                </div>\n" +
    "            </a>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>"
  );

}]);
