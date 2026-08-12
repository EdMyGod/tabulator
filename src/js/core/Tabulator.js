'use strict';

import defaultOptions from './defaults/options.js';

import ColumnManager from './ColumnManager.js';
import RowManager from './RowManager.js';
import FooterManager from './FooterManager.js';

import InteractionMonitor from './tools/InteractionMonitor.js';
import ComponentFunctionBinder from './tools/ComponentFunctionBinder.js';
import DataLoader from './tools/DataLoader.js';

import ExternalEventBus from './tools/ExternalEventBus.js';
import InternalEventBus from './tools/InternalEventBus.js';

import DeprecationAdvisor from './tools/DeprecationAdvisor.js';
import DependencyRegistry from './tools/DependencyRegistry.js';

import ModuleBinder from './tools/ModuleBinder.js';

import OptionsList from './tools/OptionsList.js';

import Alert from './tools/Alert.js';

class Tabulator extends ModuleBinder{

	//default setup options
	static defaultOptions = defaultOptions;

	static extendModule(){
		Tabulator.initializeModuleBinder();
		Tabulator._extendModule(...arguments);
	}

	static registerModule(){
		Tabulator.initializeModuleBinder();
		Tabulator._registerModule(...arguments);
	}

	constructor(element, options, modules){
		super();

		Tabulator.initializeModuleBinder(modules);

		this.options = {};
		
		this.columnManager = null; // hold Column Manager
		this.rowManager = null; //hold Row Manager
		this.footerManager = null; //holder Footer Manager
		this.alertManager = null; //hold Alert Manager
		this.vdomHoz  = null; //holder horizontal virtual dom
		this.externalEvents = null; //handle external event messaging
		this.eventBus = null; //handle internal event messaging
		this.interactionMonitor = false; //track user interaction
		this.browser = ""; //hold current browser type
		this.browserSlow = false; //handle reduced functionality for slower browsers
		this.browserMobile = false; //prevent resize cancelling edit on keyboard appearance
		this.rtl = false; //check if table is in RTL mode
		this.originalElement = null; //hold original table element if it has been replaced
		
		this.componentFunctionBinder = new ComponentFunctionBinder(this); //bind component functions
		this.dataLoader = false; //bind component functions
		
		this.modules = {}; //hold all modules bound to this table
		this.modulesCore = []; //hold core modules bound to this table (for initialization purposes)
		this.modulesRegular = []; //hold regular modules bound to this table (for initialization purposes)
		
		this.deprecationAdvisor = new DeprecationAdvisor(this);
		this.optionsList = new OptionsList(this, "table constructor");

		this.dependencyRegistry = new DependencyRegistry(this);
		
		this.initialized = false;
		this.destroyed = false;
		
		if(this.initializeElement(element)){
			
			this.initializeCoreSystems(options);
			
			//delay table creation to allow event bindings immediately after the constructor
			setTimeout(() => {
				this._create();
			});
		}
		
		this.constructor.registry.register(this); //register table for inter-device communication
	}
	
	initializeElement(element){
		if(typeof HTMLElement !== "undefined" && element instanceof HTMLElement){
			this.element = element;
			return true;
		}else if(typeof element === "string'){
			this.element = document.querySelector(element);
			
			if(this.element){
				return true;
			}else{
				console.error("Tabulator Creation Error - no element found matching selector: ", element);
				return false;
			}
		}else{
			console.error("Tabulator Creation Error - Invalid element provided:", element);
			return false;
		}
	}

	getColumns(structured){
		return this.columnManager.getComponents(structured);
	}

	getColumnVisibilityMenu(){
		var buildMenu = (columns) => {
			return columns.reduce((menu, column) => {
				var definition = column.getDefinition();
				var subColumns = column.getSubColumns();

				if(subColumns.length){
					var subMenu = buildMenu(subColumns);

					if(subMenu.length){
						menu.push({
							label: definition.title || "",
							menu: subMenu,
						});
					}
					return menu;
				}

				if(typeof definition.field === "undefined"){
					return menu;
				}

				var icon = document.createElement("i");
				icon.classList.add("fas", column.isVisible() ? "fa-check-square" : "fa-square");

				var label = document.createElement("span");
				label.appendChild(icon);
				label.appendChild(document.createTextNode(" " + (definition.title || "")));

				menu.push({
					label: label,
					action: (e) => {
						e.stopPropagation();
						column.toggle();
						icon.classList.toggle("fa-check-square", column.isVisible());
						icon.classList.toggle("fa-square", !column.isVisible());
						this.redraw();
					},
				});

				return menu;
			}, []);
		};

		return buildMenu(this.getColumns(true));
	}

	getColumn(field){
		var column = this.columnManager.findColumn(field);
		
		if(column){
			return column.getComponent();
		}else{
			console.warn("Find Error - No matching column found:", field);
			return false;
		}
	}

