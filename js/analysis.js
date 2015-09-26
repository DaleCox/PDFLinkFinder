var tableDefault = '<tbody><tr style="background-color:#ffffff !important;">';
	tableDefault += '<th>File Name</th>';						
	tableDefault += '<th>Link</th>';
	tableDefault += '<th>Status</th>';						
	tableDefault += '</tr>';
	tableDefault += '</tbody>';


function scanFile(fileElementID){
	var fileElement = document.getElementById(fileElementID);
	
	for (var i=0; i < fileElement.files.length; i++) {
		//var selectedFile = fileElement.files[0];//single for now
		var selectedFile = fileElement.files[i];
	
		//console.log(selectedFile);//Debug
		
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
			//console.log("PDF done! \n", result);//Debug
			AnalysisObj.FileText = result;
			AnalysisObj.TimeToRead = new Date() - readStart;
			console.log(AnalysisObj);
			
			//find all url or links
			AnalysisObj.Links = [];
			AnalysisObj.LinkStatus = [];
			var parseStart = new Date();
			var re1 = /(https?):\S*/gim;//match on http or https stop at next space
			findLinks(AnalysisObj, re1);
			
			var promiseArray =[];
			for(var i=0; i < AnalysisObj.Links.length; ++i){
				promiseArray.push(getLinkStatus(AnalysisObj.Links[i]));
			}
			Promise.all(promiseArray).then(function(values){
				for(var j=0; j < values.length; ++j){
					//console.log(values[j]);//Debug
					AnalysisObj.LinkStatus.push(values[j]);
				}
				
				var re2 = /(hjp):\S*/gim; //strange prefix or protocol that replaced http or https in my test documents
				findLinks(AnalysisObj, re2);
				
				var re2b = /(hYp):\S*/gim; //strange prefix or protocol that replaced http or https in my test documents
				findLinks(AnalysisObj, re2b);
				
				var re3 = /\s(www)\S*/gim;//grap web address with no prefix 
				findLinks(AnalysisObj, re3);
				
				AnalysisObj.TimeToParse = new Date() - parseStart;
				console.log(AnalysisObj);//Debug
				
				
				writeToClient(AnalysisObj);
				return AnalysisObj;
			});
			
			
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
	//console.log(linksFound);//Debug
	if(linksFound)
		AnalysisObj.Links = AnalysisObj.Links.concat(linksFound);	
}

function writeToClient(AnalysisObj){
	var resultsTable = document.getElementById("results");

	for(var i=0; i < AnalysisObj.Links.length; ++i){
		if(AnalysisObj.Links[i]){
			var row = document.createElement("tr");
			if(i == 0)
				row.style.borderTop = "2px solid";
			else if (i == (AnalysisObj.Links.length - 1))
				row.style.borderBottom = "2px solid";
			
			var fileCell = document.createElement("td");
			fileCell.innerHTML = AnalysisObj.Name;
			row.appendChild(fileCell);
			
			var linkCell = document.createElement("td");
			if(AnalysisObj.Links[i].indexOf("http") > -1){
				var link =  document.createElement("a");
				link.href = AnalysisObj.Links[i];
				link.target = "_blank";
				link.innerHTML = AnalysisObj.Links[i];
				linkCell.appendChild(link);
			}else
				linkCell.innerHTML = AnalysisObj.Links[i];
			row.appendChild(linkCell);
			
			var statusCell = document.createElement("td");
			statusCell.style.backgroundColor = 'Yellow';
			if(AnalysisObj.LinkStatus[i]){
				statusCell.innerHTML = AnalysisObj.LinkStatus[i];
				if(AnalysisObj.LinkStatus[i] == 200){
					statusCell.style.backgroundColor = 'Green';
					statusCell.style.color = 'white';
				}
				else if(AnalysisObj.LinkStatus[i] >= 400){
					statusCell.style.backgroundColor = 'Red';
					statusCell.style.color = 'white';
				}					
			}
			else{
				statusCell.innerHTML = "NA";				
			}
			row.appendChild(statusCell);
			
			resultsTable.appendChild(row);
		}
	}

}

//Based off guidence from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
function getLinkStatus(link){
	var promise = new Promise( function (resolve, reject) {
		var request = new XMLHttpRequest();
		request.open('GET', link, true);
		//request.setRequestHeader('Content-Type', 'text/html');
		request.onerror = function () {
			resolve(request.status);
		};
		request.onreadystatechange = function ()  {
			if(request.readyState == 4){
				//console.log('Status ',request.status);//Debug
				resolve(request.status);
			}
		};
		request.send();
	});
	return promise;
}