export default {

	debugEventsExternal:false, //flag to console log events
	debugEventsInternal:false, //flag to console log events
	debugInvalidOptions:true, //allow toggling of invalid option warnings
	debugInvalidComponentFuncs:true, //allow toggling of invalid component warnings
	debugInitialization:true, //allow toggling of pre initialization function call warnings
	debugDeprecation:true, //allow toggling of deprecation warnings

	height:false, //height of tabulator
	minHeight:false, //minimum height of tabulator
	maxHeight:false, //maximum height of tabulator

	columnHeaderVertAlign:"top", //vertical alignment of column headers

	popupContainer:true,

	columns:[],//store for colum header info
	columnDefaults:{
		resizable:false,
		minWidth:10,
		headerWordWrap:true,
		accessor:function(value){
			return value === null ? "" : value;
		},
	}, //store column default props

	headerSortElement:function(column, dir){
		switch(dir){
			case "asc":
				return "<i class='fa fa-sort-up' style='color:green'>";
			case "desc":
				return "<i class='fa fa-sort-down' style='color:red'>";
			default:
				return "<i class='fa fa-sort' style='color:white'>";
		}
	},

	movableColumns:true,

	rowHeader:false,

	data:false, //default starting data

	autoColumns:false,
	autoColumnsDefinitions:false,

	nestedFieldSeparator:".", //separator for nested data

	footerElement:false, //hold footer element

	index:"id", //filed for row index

	textDirection:"auto",

	addRowPos:"bottom", //position to insert blank rows, top|bottom

	headerVisible:true, //hide header

	renderVertical:"virtual",
	renderHorizontal:"basic",
	renderVerticalBuffer:0, // set virtual DOM buffer size

	scrollToRowPosition:"top",
	scrollToRowIfVisible:true,

	scrollToColumnPosition:"left",
	scrollToColumnIfVisible:true,

	rowFormatter:false,
	rowFormatterPrint:null,
	rowFormatterClipboard:null,
	rowFormatterHtmlOutput:null,

	rowHeight:null,

	placeholder:false,

	dataLoader:true,
	dataLoaderLoading:false,
	dataLoaderError:false,
	dataLoaderErrorTimeout:3000,
	dataSendParams:{},
	dataReceiveParams:{},

	dependencies:{},
};