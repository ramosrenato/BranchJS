/**
* Construtor: brjs.Class
* Classe base que � usada como base para construir 
* todas as outras classes. 
* Inlui suporte para heran�a multipla.
* 
*  var MyClass = brjs.class(Class1, Class2, prototype);
*  MyClass ser� uma classe que herda Class1, Class2 e um "prototype" opcional
*
*/
brjs.Class = function() {
    
	/** 
	 * cria um objeto vazio.
	 * c�digo inline para melhorar a performance
	 */
	
	var cl = function() {
        if (arguments && arguments[0] != brjs.Class.isPrototype) {
            this.initialize.apply(this, arguments);
        }
    };
    
    var pnt, init, ext = {};
    
    /** 
     * varre todos os argumentos. 
     * para cada argumento que � identificado como um prototype ou function,
     * come�a a herdar cada m�todo e atributo do objeto
     */ 
    
    for (var i = 0, l = arguments.length; i < l; ++i) {
        if (typeof arguments[i] == "function") {
            
        	/** 
        	 * transforma a primeira classe, na lista de argumentos,
        	 * na superclasse.
        	 */ 
        	
            if (i == 0 && l > 1) {
                                
                /** 
                 * troca o metodo initialize para um m�todo vazio,
                 * isso pq n�s n�o queremos criar um instancia real
                 */
            	
                init = arguments[i].prototype.initialize;
                arguments[i].prototype.initialize = function() { };
                
                /** 
                 * the line below makes sure that the new class has a
                 * superclass
                 */
                
                ext = new arguments[i];
                
                /**
                 * restaura o m�todo initialize original da classe
                 */
                
                if (init === undefined) {
                    delete arguments[i].prototype.initialize;
                } else {
                    arguments[i].prototype.initialize = init;
                }
            }
            
            // get the prototype of the superclass
            pnt = arguments[i].prototype;
            
        } else {
            // in this case we're extending with the prototype
            pnt = arguments[i];
        }
        
        // faz uso do m�todo est�tico 'extend', 
        // para mesclar atributos e m�todos
        brjs.Object.extend(ext, pnt);
    }
    
    //copia o objeto j� extendido para o objeto vazio 
    cl.prototype = ext;
    
    return cl;
};

/**
 * M�todo est�tico que retorna um valor "prototype"
 * Esse m�todo � usado para verificar se o objeto que est� sendo testado
 * � realmente um "prototype" v�lido
 */ 
brjs.Class.isPrototype = function() { };

/**
 * M�todo est�tico que retorna um prototype vazio
 * Utilizado para um tipo de constru��o conforme o ex:
 * 
 *  var MyClass = brjs.class.create();
 *  MyClass.prototype.myParam = 0;
 *  MyClass.prototype.myFunction = new function(){return true;};
 *  
 */
brjs.Class.create = function() {
    return function() {
        if (arguments && arguments[0] != brjs.class.isPrototype) {
            this.initialize.apply(this, arguments);
        }
    };
};