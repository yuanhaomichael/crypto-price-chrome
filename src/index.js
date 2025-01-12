$(document).ready(function(){
    const apiKey = "6dcd4f6925dee5654c6d1d564d97d4a922721b8258e5490e0dfc34fcb70c3606";
    const urlFirst = "https://min-api.cryptocompare.com/data/price?fsym=";
    const urlSecond = "&tsyms=";
    const form = $('#symform');
    
    // CLEAR SYNC STORAGE: 
    // chrome.storage.sync.clear(); 

    // update price of all symbols on the watchlist
    $("body").ready(function(){    
        loadSymbols();      
    });



    // hear onclick event of delete icon
    $('body').on('click', '#delete', function(e){
        console.log("working")
        // retrieve alert's notify_id by parsing id and parent id
        alert_id = $(this).prevAll('form').first().attr('id')
        parent_id = $(this).parent().parent().attr('id')
        
        var x = alert_id.length - 1
        var alert_hash
        while(x >= 0){
            if(alert_id.charAt(x)=='-'){
                alert_hash = alert_id.substring(x+1, alert_id.length);
                break
            }
            x = x-1;   
        }
        var x = parent_id.length - 1
        var cur_symbol = 0
        while(x >= 0){
            if(parent_id.charAt(x)=='-'){
                cur_symbol = parent_id.substring(x+1, parent_id.length);
                break
            }
            x = x-1;   
        }
        var price = 0;
        for(var c=0; c < alert_id.length; c++){
            if(alert_id.charAt(c) == '-'){
                price = alert_id.substring(0,c)
                price = String(price).replace('_','.')
                price = parseFloat(price)
                break
            }
        }
        
        console.log(cur_symbol, price, alert_hash)

        notify_id = cur_symbol + "_" + alert_hash + "_" + String(price)
        deleteAlert(notify_id)

        // delete the UI
        $(this).prevAll('form').first().remove();
        $(this).remove()
    })



    // event triggered when "Check Price" is clicked, to check price of a symbol
    $('#symform').on('submit', function( e ){ 
        e.preventDefault();
        var sym = $("input").first().val()
        getPrice(sym);
    });
 


    // event triggered when "Add to Watchlist" is clicked, to add a symbol to watchlist
    $('#add-to-watchlist').on('click', function( e ){
        e.preventDefault();
        var sym = $("input").first().val()
        addToList(sym);
    })

    $(document).on('keydown', function(e){
        if(e.which==13 && e.shiftKey){
            e.preventDefault();
            var sym = $("input").first().val()
            addToList(sym); 
        }
    });




    // call API to get the price of a symbol
    function getPrice(a){
        symbol = a;
        // console.log(symbol)
        const url = urlFirst + symbol + urlSecond + 'USD&api_key=' + apiKey;
        fetch(url)
            .then(r => {
                return r.text()
            })
            .then(response => {
                var json = JSON.parse(response)
                var price = json["USD"] 
                // console.log(price)
                if(price!=undefined){   
                    $('.error').html("")
                    $('#price').html("<p></p>")
                    $('#price').append(price)
                    $('#price').append(" USD")
                    $('#price').css("font-weight", "100")
                    $('#price').css("font-size", "12px")
                } else {
                    $('#price').html("<p></p>")
                    $('.error').html("<p>Doesn't exist!</p>")
                    $('.error').css("font-weight", "100")
                    $('.error').css("font-size", "12px")
                    $('.error').css("display", "inline-block")
                }
         
        })    
    }




    // add a symbol to watchlist and call API to display its price
    // update the price every hour
    function addToList(a){
        
        symbol = a;
        const url = urlFirst + symbol + urlSecond + 'USD&api_key=' + apiKey;

        fetch(url)
            .then(r => {
                return r.text()
            })
            .then(response => {
                var json = JSON.parse(response)
                var price = json["USD"] 
                if(price!=undefined){   
                    // add a new div with id "watchlist-item-[symbol]"
                    $('.error-watchlist').html("<p></p>")
                    var newId = 'watchlist-item' + "-" + symbol;
                    var newId2 = "#" + newId;
                    if($('body').find(newId2).length==0){
                        $('body').append("<div id=\"sample\"></div>")
                        $('#sample').attr('id', newId);
                    } 
                    
                    // modify template watchlist-item
                    var upperSymbol = symbol.toUpperCase();
                    $("#watchlist-item").find('#symbol-name').html("<span></span>");
                    $("#watchlist-item").find('#symbol-name').append(upperSymbol);
                    $("#watchlist-item").find('#symbol-price').html("<span></span>");
                    $("#watchlist-item").find('#symbol-price').append(price);
                    $("#watchlist-item").find('#symbol-price').append(" USD");
                    
                    
                    // get the html and append it to the "watchlist-item-[symbol]" div
                    var item = $('#watchlist-item-wrapper').html();
                    if($(newId2).find("#watchlist-item").length==0){
                        $(newId2).append(item)
                        $('#tooltip').css("display", "none")

                        idStore = "#watchlist-item-" + symbol;
                        var storeItem = $(idStore).prop('outerHTML');
                        // store user data, the symbol itself, and the code snippet
                        storeSymbol(String(symbol), storeItem);

                        $('.error-watchlist').html("<p>Success!</p>")
                        $('.error-watchlist').css("font-weight", "100")
                        $('.error-watchlist').css("font-size", "12px")
                        $('.error-watchlist').css("display", "inline-block")

                    } else {
                        // user already added this symbol
                        $('.error-watchlist').html("<p>Already exists!</p>")
                        $('.error-watchlist').css("font-weight", "100")
                        $('.error-watchlist').css("font-size", "12px")
                        $('.error-watchlist').css("display", "inline-block")
                    }
                    $(newId2).find('#watchlist-item').css("display", "block")               
                } else {
                    $('.error-watchlist').html("<p>Doesn't exist!</p>")
                    $('.error-watchlist').css("font-weight", "100")
                    $('.error-watchlist').css("font-size", "12px")
                    $('.error-watchlist').css("display", "inline-block")
                }
            })    
    }


    


    // store a key value pair such that the key is "symbols"
    // the value is an array, to keep track of all symbols on the watchlist
    // Uses chrome storage to store the symbols on the watchlist
    function storeSymbol(symbol, item){
        var key = symbol,
        jsonfile = {};
        jsonfile[key] = item;
        chrome.storage.sync.set(jsonfile, function() {});

        tmp = [];
        chrome.storage.sync.get(['symbols'], function(result) {
            if(result['symbols']==undefined){               
                tmp = []
                tmp.push(symbol)
                console.log("pushed", symbol)
                chrome.storage.sync.set({'symbols': tmp});  
            } else{
                tmp = result['symbols']
                if(!tmp.includes(symbol)){
                    tmp.push(symbol)
                    console.log("pushed", symbol)
                }
                chrome.storage.sync.set({'symbols': tmp});
            }
            // console.log(result)
        });
    }




    
    // when user sets a price alert, store this alert in the sync storage of chrome
    // in the format: {[symbol]_1: alert code snippet}
    // parse the speific alert, use triggerAlert() to trigger notification
    $('body').on('click', '#set-alert', function( e ){
        e.preventDefault();
        // get the symbol name from parent div
        var id = $(this).parent().parent().attr('id')
        var len = id.length
        var i = len-1
        var symbol1
        while(i >= 0){
            if(id.charAt(i)==="-"){
                symbol1 = id.substr(i+1, len-1)
                
                break
            }
            i--
        }

        // get price target from the form
        var alertId = "#watchlist-item-" + symbol1
        var target = $(alertId).find('input').val()
        target = parseFloat(target)

        if(target > 0){
            // store alert and trigger alert 
            var hash = generateHash()
            
            //clone price-alert template, change id of the previous "price-alert" to "[target]-price-alert-[hash]"
            var alertForm = $(alertId).find('#price-alert').prop('outerHTML')
            var setAlertButton = $(alertId).find('#set-alert').prop('outerHTML')

            var oldId = $(alertId).find('#price-alert').attr('id')
            var newId = String(target).replace('.', "_") + "-" + oldId + "-" + String(hash)
            var newId2 = "#"+ newId
            $(alertId).find('#price-alert').attr('id', newId)
            target = String(target)
            // display alert under symbol name, toggle alert button to delete button
            var text = "Price alert at $" + target + " USD"
            
            $(alertId).find(newId2).html('<p></p>')
            $(alertId).find(newId2).append(text)
            $(alertId).find(newId2).css("display", "inline")
            $(alertId).find(newId2).css("margin-bottom", "1px", "margin-top", "1px")
            $(alertId).find('#set-alert').remove()
            var deleteHash =  "delete"
            $(alertId).find("br").remove();
            $(alertId).find(newId2).after('<button id="set-alert" style="margin-left: 10px; margin-top:-2px;height: 30px; padding: 5px; display: inline-block" class="button-17"> 🗑</button><br>')
            $(alertId).find('#set-alert').attr('id', deleteHash)
            var alertCode = $(alertId).find(newId2).prop('outerHTML')
            + $(alertId).find("#"+deleteHash).prop('outerHTML');

            var notify_id = symbol1 + "_" + String(hash) + "_" + target

            // store alerts in chrome sync storage in the format {a_symbol_hash_priceTarget (var notify_id): code snippet}
            chrome.storage.sync.get(['alerts'], function(result) {
                if(result['alerts']==undefined){
                    tmp = []
                    tmp.push(notify_id)
                    chrome.storage.sync.set({'alerts': tmp});
                } else{
                    tmp = result['alerts']
                    if(!tmp.includes(notify_id)){
                        tmp.push(notify_id)
                    }
                    chrome.storage.sync.set({'alerts': tmp});
                }
                // console.log(result)
            });
            var key = notify_id,
            jsonfile = {};
            jsonfile[key] = alertCode;
            chrome.storage.sync.set(jsonfile, function() {});

            // append the price-alert template and the bell button template
            $(alertId).find(newId2).next().after(alertForm)
            $(alertId).find('#price-alert').css('display', 'inline-block', 'margin-top', '1px', 'margin-bottom', '0px')
            $(alertId).find('#price-alert').after(setAlertButton)
            // $(alertId).find('#price-alert').before("<br>")
            $(alertId).find('#set-alert').css('margin-bottom', '0px')
            $(alertId).find('hr').css('margin-top', '0px')
        }

    })




    // Get from chrome storage all the symbols on the watchlist
    // format is {symbol: code_snippet}
    function loadSymbols(){
        // load all symbols 
        chrome.storage.sync.get(null, (items) => {
            // Pass any observed errors down the promise chain.
            if (chrome.runtime.lastError) {
              return reject(chrome.runtime.lastError);
            }

            // Pass the data retrieved from storage down the promise chain.
            // get all the symbols from watchlist
            arr = items['symbols'];
            if(arr?.length>0){
                for(var i=0; i<arr.length; i++){
                    // for each symbol on the watchlist, append code snippet to body, and update price
                    let sym1 = arr[i];
                    let code = items[sym1];
                    $('body').append(code);
                    let id_name = "#watchlist-item-" + sym1;
                    $('#tooltip').css("display", "none")
                    // console.log(code)
                    
                    var json;
                    const url = urlFirst + sym1 + urlSecond + 'USD&api_key=' + apiKey;
                    fetch(url)
                        .then(r => {
                            return r.text()
                        })
                        .then(response => {
                            json = JSON.parse(response)
                            price = json["USD"]  
                            // console.log(sym1, ":", price)
                            $(id_name).find('#symbol-price').html("<span></span>"); 
                            $(id_name).find('#symbol-price').append(price);  
                            $(id_name).find('#symbol-price').append(" USD"); 
                            $(id_name).find('#watchlist-item').css("display", "block") 
                        }) 
                }
            }
        });

        // load all alerts under each symbol 
        chrome.storage.sync.get(null, (items) => {
            // Pass any observed errors down the promise chain.
            if (chrome.runtime.lastError) {
              return reject(chrome.runtime.lastError);
            }
            console.log(items)
            // get all the alerts and display them
            arr = items['alerts'];
            if(arr?.length>0){
                for(var i=0; i<arr.length; i++){
                    // for each symbol on the watchlist, append code snippet to body, and update price
                    let notify_id = arr[i];
                    
                    var end = 0;
                    for(var c=0; c < notify_id.length; c++){
                        if(notify_id.charAt(c) == '_'){
                            end = c;
                            break
                        }
                    }
                    var sym = notify_id.substr(0, c);
                    // console.log(sym)
                    let code = items[notify_id];
                    // console.log(code)
                    $('#watchlist-item-'+sym).find("#basic-info").after(code);
                    

                }
            }
        });

    }




    function generateHash(){
        //return a unique hash
        var hash = Date.now()
        return hash
    }




    //delete an alert 
    function deleteAlert(notify_id){
        console.log("alert deleted ", notify_id)
        // remove the key that is named notify_id and remove the notify_id in the alerts array
        chrome.storage.sync.remove(notify_id, function(item) {
            // console.log("Removed")
        });
        chrome.storage.sync.get(['alerts'], function(result) {
            if(result['alerts']==undefined){
                chrome.storage.sync.set({'alerts':[]});
            } else{
                tmp = result['alerts']
                if(tmp.includes(notify_id)){
                    var filtered = tmp.filter(function(value, index, arr){ 
                        return value!=notify_id ;
                    });
                }
                chrome.storage.sync.set({'alerts': filtered});
                // console.log(filtered)
            }
        })

        // remove in the front end by getting the hash, remove #delete-hash and price-alert-hash
        var begin;
        for(var c=0; c < notify_id.length; c++){
            if(notify_id.charAt(c) == '_'){
                begin = c+1;
                break
            }
        }
        var x = notify_id.length - 1
        var hash;
        while(x >= 0){
            if(notify_id.charAt(x)=='_'){
                hash = notify_id.substring(begin, x);
                break
            }
            x = x-1;   
        }

        // console.log(hash)
        $('#delete-'+hash).remove();
        $('#price-alert-'+hash).remove();

    }

})


// TODO:
// - service worker does not fire consistently. Sometimes it's inactive. (Perhaps start service worker on user click popup?)
// - alerts doesn't get deleted when you delete them - still firing notifications