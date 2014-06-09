/**
* Namespace: brjs.Document
*/
brjs.Document = {
		
		clientWidth: function(){
			return window.innerWidth;
			/*if (self.innerHeight)
				return self.innerWidth;
		    else if (document.DocumentElement && document.DocumentElement.clientHeight)
		    	return document.DocumentElement.clientWidth;
		    else if (document.body)
		    	return document.body.clientWidth;
		    else
		    	return 0;*/
		},
		
		clientHeight: function(){
			return window.innerHeight-5;
			/*if (self.innerHeight)
				return self.innerHeight;
			else if (document.DocumentElement && document.DocumentElement.clientHeight)
				return document.DocumentElement.clientHeight;
			else if (document.body)
			    return document.body.clientHeight;
			else
				return 0;*/	
		}
		
};
