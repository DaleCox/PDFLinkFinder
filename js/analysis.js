function scanFile(fileElementID){
	var fileElement = document.getElementById(fileElementID);
	
	for (var i=0; i < fileElement.files.length; i++) {
		//var selectedFile = fileElement.files[0];//single for now
		var selectedFile = fileElement.files[i];
	
		//console.log(selectedFile);//debug
	
		readFileFindLinks(selectedFile);	
	}	
	
	return false;
}

/*
// Portions of this function are based on post found on
// http://stackoverflow.com/questions/22048395/how-to-open-a-local-pdf-in-pdfjs-using-file-input
*/
function readFileFindLinks(selectedFile){
	var readStart = new Date();
	var AnalysisObj = {
		Name : selectedFile.name,
		FileSize : selectedFile.size,
		TimeToRead : 0,
		FileText : ''
		};
	
	var fileReader = new FileReader();  
	
	fileReader.onload = function() {
		//turn array buffer into typed array
		var typedarray = new Uint8Array(this.result);
		
		readPDFToText(typedarray).then(function(result) {
			//console.log("PDF done! \n", result);//debug
			AnalysisObj.FileText = result;
			AnalysisObj.TimeToRead = new Date() - readStart;
			console.log(AnalysisObj);
			
			//find all url or links
			AnalysisObj.Links = []
			var parseStart = new Date();
			var re1 = /(https?):\S*/gim;//match on http or https stop at next space
			findLinks(AnalysisObj, re1);
			
			var re2 = /(hjp):\S*/gim; //strange prefix or protocol that replaced http or https in my test documents
			findLinks(AnalysisObj, re2);
			
			var re3 = /\s(www)\S*/gim;//grap web address with no prefix 
			findLinks(AnalysisObj, re3);
			
			AnalysisObj.TimeToParse = new Date() - parseStart;
			console.log(AnalysisObj);
			
			writeToClient(AnalysisObj);
		});
	};

	//Read the file as ArrayBuffer
	fileReader.readAsArrayBuffer(selectedFile);	
}

/*
// This function was sourced from
// http://stackoverflow.com/questions/1554280/extract-text-from-pdf-in-javascript
*/
function readPDFToText(typedarray){
	PDFJS.workerSrc = 'js/pdf.worker.js';
	PDFJS.cMapUrl = 'js/cmaps/';
	PDFJS.cMapPacked = true;

	return PDFJS.getDocument(typedarray).then(function(pdf) {
		var pages = [];
		for (var i = 0; i < pdf.numPages; i++) {
			pages.push(i);
		}
		return Promise.all(pages.map(function(pageNumber) {
			return pdf.getPage(pageNumber + 1).then(function(page) {
				return page.getTextContent().then(function(textContent) {
					return textContent.items.map(function(item) {
						return item.str;
					}).join(' ');
				});
			});
		})).then(function(pages) {
			return pages.join("\r\n");
		});
	});
}

function findLinks(AnalysisObj, regex){	
	var linksFound = AnalysisObj.FileText.match(regex);
	//console.log(linksFound);//debug
	AnalysisObj.Links = AnalysisObj.Links.concat(linksFound);	
}

function writeToClient(AnalysisObj){
	var resultsTable = document.getElementById("results");
	var htmlNode = '';
	for(var i=0; i < AnalysisObj.Links.length; ++i){
		if(AnalysisObj.Links[i]){
			htmlNode += '<tr>';
				htmlNode += '<td>';
				htmlNode += AnalysisObj.Name;
				htmlNode += '</td>';				
				htmlNode += '<td>';
				htmlNode += AnalysisObj.Links[i];
				htmlNode += '</td>';					
			htmlNode += '</tr>';
		}
	}
	
	resultsTable.innerHTML += htmlNode;
}