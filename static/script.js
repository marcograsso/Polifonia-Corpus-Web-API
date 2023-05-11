// general rules
  var more_button_clicks = 0;
  var currentRequest = null;
  var currentLemma = null;
  var currentModule = null;
  var currentLang = null;
  var currentType = null;
  var currentNumb = null;
  var currentConcept = null;
  var currentEntity = null;
  var checked_rows = [];

//Enter Key event
  $(function() {
     $("#lemma").keyup(function(event) {
         if (event.keyCode === 13) {
             $("#calculate").click();
             }
     });
 });


// Search
  $(function() {
    $('#calculate').bind('click', function() {

      if(currentRequest != null) {
           currentRequest.abort();
       };
      $(".sent_source").remove();
      more_button_clicks = 0;
      checked_rows.length = 0;
      document.getElementById("select").innerHTML = "";
      document.getElementById("stats").innerHTML = "";
      document.getElementById("entrance_view").setAttribute('data-before', "");
      if (document.getElementById("reset").disabled = true) {
            document.getElementById("reset").disabled = false;
      };
      document.getElementById("reset_label").classList.add("reset_label-active");
      document.getElementById("selected-download-main").innerHTML = "Save Selected (0)";
      if (document.getElementById("errors_count")) {
        document.getElementById("errors_count").innerHTML = "0";
      }; 
      
      $("#select_all").prop('checked', false);

      currentLemma = $('input[name="lemma"]').val();
      currentModule = $('select[name="module"]').val();
      currentLang = $('select[name="lang"]').val();
      currentType = $('select[name="type"]').val();
      currentNumb = $('input[name="numb"]').val();

       if (currentType == "keyword") {
       $("#select").hide();
       $("#stats").show();
       $("#stats").html("<div class='stats_row stats_keyword'>... </div>");
       $("#result").show();
       $("#result").html("<img class='loader' src='static/svg/loader.gif'>");
       $("#select_all").show();

       } else if (currentType == "lemma") {
       $("#select").hide();
       $("#stats").show();
       $("#stats").html("<div class='stats_row stats_keyword'>... </div>");
       $("#result").show();
       $("#result").html("<img class='loader' src='static/svg/loader.gif'>");
       $("#select_all").show();

       } else if (currentType == "entity") {
       $("#result").show();
       $("#select_all").hide();
       $("#select").show();
       $("#stats").show();
       $("#stats").html("<div class='stats_row'><img class='loader_select' src='static/svg/loader.gif'></div>");
       document.getElementById("select").classList.remove('expand');

       } else if (currentType == "concept") {
       $("#result").show();
       $("#select_all").hide();
       $("#select").show();
       $("#stats").show();
       $("#stats").html("<div class='stats_row'><img class='loader_select' src='static/svg/loader.gif'></div>");
       document.getElementById("select").classList.remove('expand');
      };

      currentRequest = $.getJSON($SCRIPT_ROOT + '/corpus/search', {
        a: currentLemma,
        b: currentModule,
        c: currentLang,
        d: currentType,
        n: currentNumb
      }, function(data) {
        var results = data.result;
        var stats = data.stat;
        var text_rows = filler_text(results);
        var stat_rows = filler_stats(stats, results);
        $('.active-stats-module').html(currentModule); 
        var reg = /\-/;
        var strippedtext = currentModule.replace(reg, "");
        changeStats(eval("stats" + strippedtext));
        if (currentType == "concept") {
            $("#select").html(text_rows);
            $("#stats").html(stat_rows);
            $("#result").html("");
            document.getElementById("more_button").disabled = true;
            document.getElementById("report_button").disabled = true;
            document.getElementById("download_button").disabled = true;
            document.getElementById("download_label").classList.remove("download_label-active");
                document.getElementById("download_dropdown").style.display="none";
                $("#download_dropdown-2").hide();
                $("#download_dropdown-1").hide;
                document.getElementById("download_button").classList.remove('download_button-active');
                document.getElementById("view_button").classList.remove('view_button-active');
            document.getElementById("select_all").disabled = true;
            document.getElementById("view_button").disabled = true;
            concept_click();
         } else if (currentType == "entity") {
            $("#select").html(text_rows);
            $("#stats").html(stat_rows);
            $("#result").html("");
            document.getElementById("more_button").disabled = true;
            document.getElementById("report_button").disabled = true;
            document.getElementById("download_button").disabled = true;
            document.getElementById("download_label").classList.remove("download_label-active");
                document.getElementById("download_dropdown").style.display="none";
                $("#download_dropdown-2").hide();
                $("#download_dropdown-1").hide;
                document.getElementById("download_button").classList.remove('download_button-active');
                document.getElementById("view_button").classList.remove('view_button-active');
            document.getElementById("select_all").disabled = true;
            document.getElementById("view_button").disabled = true;
            entity_click();
         } else {
            $("#result").html(text_rows);
            $("#stats").html(stat_rows);
            $("#select_all").show();
            document.getElementById("more_button").disabled = false;
            document.getElementById("report_button").disabled = false;
            document.getElementById("download_button").disabled = false;
            document.getElementById("download_label").classList.add("download_label-active");
            document.getElementById("select_all").disabled = false;
            source_click();
            sent_click();
            report_click()
            close_full_sent_click();
            close_source_click();
            // document.getElementById("stats").innerHTML = "<div id='' class='stats_row'>"+ stats +"</div>";
         };
      });
      return false;
    });
  });



// More results +20
  $(function() {
    $('input#more_button').bind('click', function() {
      $( "#result" ).append( "<div class='sent_row' id='loading_icon'><img class='loader_more' src='static/svg/loader.gif'></div>" );
      $('#result').scrollTop($('#result')[0].scrollHeight);
      more_button_clicks+= 20;
      $("#select_all").prop('checked', false);
      var number = parseInt(currentNumb);
      var value = number + more_button_clicks
      $.getJSON($SCRIPT_ROOT + '/corpus/search', {
        a: currentLemma,
        b: currentModule,
        c: currentLang,
        d: currentType,
        n: value.toString(),
        k: currentConcept,
        e: currentEntity
      }, function(data) {
        var results = data.result;
        var text_rows = filler_text(results);
        $("#result").html(text_rows);
        currentCount = checked_rows.length;
        source_click();
        sent_click();
        report_click()
        close_full_sent_click();
        close_source_click();
        for (let i = 0; i < currentCount; i++) {
            select = checked_rows[i];
            copy = "#" +select + " :input"
            $(copy).trigger("click");
        };
      });
      return false;
    });
  });


// Populate results rows
   function filler_text(results) {
    var display_text = "";
    var results_length = results.length;
    for (var i = 0; i < results_length; i++) {
        var result = results[i];
        var pos = i + 1;
        var sentence = style_sentence(result,pos);
        display_text+=sentence
        };
    return display_text;
    };

    function filler_stats(stats, results) {
      var results_length = results.length.toString();
      var stat_tot = stats;
      var display_text = "";
      if (currentLemma == "") {
        display_text = "<div id='' class='stats_row'>There are no results for this word.</div>";
      } else if (currentType == "keyword") {
       display_text = "<div id='' class='stats_row stats_keyword'>The keyword   <b>" + currentLemma + "</b>   is associated with <b>" + stat_tot + "</b> sentences.</div>";
      } else if (currentType == "lemma") {
       display_text = "<div id='' class='stats_row stats_keyword'>The lemma  <b>" + currentLemma + "</b>   is associated with <b>" + stat_tot + "</b> sentences.</div>";
      } else if (currentType == "concept") {
       display_text = "<div id='' class='stats_row'>The word   <b>" + currentLemma + "</b>   is associated with <b>" + results_length + "</b> concepts. The concepts extracted from the Polifonia <i>Lexicon</i> are bookmarked <img class='stats-icon-bookmark' src='static/svg/polifonia-lexicon.svg'> .<br>Please select one concept from the list below: </div>";
      } else if (currentType == "entity") {
       display_text = "<div id='' class='stats_row'>The word   <b>" + currentLemma + "</b>   is associated with <b>" + results_length + "</b> entities.<br>  Please select one concept from the list below: </div>";
      }
      return display_text;
    };

   function style_sentence(result, pos) {
    if (result[0] == "No results found") {
    return "<div class='noresults_row' >"+ result[1] + "</div>";

    } else if (result[0] == "Concept") {
    return "<div class='concept_row' id='"+ pos.toString() + "'>"+ result[1] + "</div>";

    }  else if (result[0] == "Concept-Polifonia") {
    return "<div class='concept_row concept_row_polifonia' id='"+ pos.toString() + "'>"+ result[1] + "</div>";

    } else if (result[0] == "Entity") {
    return "<div class='entity_row' id='"+ pos.toString() + "'>"+ result[1] + "</div>";

    } else {
    var id, key, left, number, right, sent, fullsent;
    var reg = /\<||\>/g;
    number = "<div class='sent_pos'>" + pos.toString() + "</div>";
    id = "<div class='sent_id'>" + result[0].replace(reg,"") + "</div>";
    left = "<div class='sent_left'>" + result[1].replace(reg,"") + "</div>";
    key = "<div class='sent_key'>" + result[2].replace(reg,"") + "</div>";
    right = "<div class='sent_right'>" + result[3].replace(reg,"") + "</div>";
    var rep = result[2].replace(/\s/g,'');
    var re = new RegExp(rep);
    sent = result[4].replace(reg,"").replace(re, "<b>"+ rep +"</b>");
    fullsent = "<div class='full_sent' id='fullsent"+ pos.toString() + "'><div class='close_full_sent'></div><p><b>Sentence n. " + pos.toString() +"</b><br><br><span class='full_sentence' id='full_sentence"+ pos.toString() + "'>"+ sent + "</span></p></div>";
    check_box = '<div class="checker_box"><input type="checkbox" id="' + 'check_' + pos.toString() + '" name="checkbox" class="sent_checkbox" value="" onchange="doCheck(this)"> <label for="' + 'check_' + pos.toString() + '"></label></div>';
    return "<div class='sent_row' id='row"+ pos.toString() + "'>" + number + id + left + key + right + check_box +"</div>" + fullsent;
    }
    };


// Reset search
  function myReset() {
    currentRequest.abort();
    currentRequest = null;
    more_button_clicks = 0;
    checked_rows.length = 0;
    document.getElementById("selected-download-main").innerHTML = "Save Selected (0)";
    if (document.getElementById("errors_count")) {
      document.getElementById("errors_count").innerHTML = "0";  
    }
    document.getElementById("more_button").disabled = true;
    document.getElementById("report_button").disabled = true;
    document.getElementById("view_button").disabled = true;
    document.getElementById("download_button").disabled = true;
    document.getElementById("download_label").classList.remove("download_label-active");
    document.getElementById("download_dropdown").style.display="none";
    $("#download_dropdown-2").hide();
    $("#download_dropdown-1").hide;
    document.getElementById("download_button").classList.remove('download_button-active');
    document.getElementById("view_button").classList.remove('view_button-active');
    document.getElementById("select_all").disabled = true;
    document.getElementById("result").innerHTML = "<p class='welcome-text'>Please insert a <b>lemma</b> in the query input  box <br>Click on the <b>Run</b> button to start the query and interrogate the Polifonia Corpus</p>";
    document.getElementById("select").innerHTML = "";
    document.getElementById("stats").innerHTML = "";
    document.getElementById("lemma").value = '';
    document.getElementById("module").value = '';
    document.getElementById("lang").value = '';
    document.getElementById("type").value = '';
    document.getElementById("number").value = '';
    $("#select").hide();
    $("#stats").hide();
    document.getElementById("entrance_view").setAttribute('data-before', "");
    document.getElementById("view_label").classList.remove("view_label-active");
    lexiconList = lexiconEN;
    autocomplete(document.getElementById("lemma"), lexiconList);
    $('.active-stats-module').html("All");
    changeStats(eval("statsAll"));
    $('#stat-entities-icon').hide();
    $('#stat-entities').hide();
    $(".sent_source").remove();
};

// Clickable row elements
function source_click() {
    $('.sent_id').bind('click', function() {
        var row_id = event.target.parentNode.id;
        var source_id = row_id.replace('row','source_');
        var content = $(event.target).text();
        if( content.indexOf("http") == 0 ) {
            content = "<a href='"+ content + "' target='_blank'>" + content +"</a>"
         }
        $("#bottom-spacer").append("<div class='sent_source' id='"+ source_id +"'><div class='close_source' id='close_source'></div><p><b>Source</b><br><br> " + content +"</p></div>");
        close_source_click()
         if ($(".sent_source").is(":visible")) {
         $(".sent_source").hide();
         $("#"+source_id).show();
         } else {
         $("#"+source_id).slideDown();
         }
         $(".full_sent").slideUp();
    });
};

function sent_click() {
    $('.sent_key').bind('click', function() {
         var row_id = event.target.parentNode.id;
         var full_sent_id = row_id.replace('row','fullsent');
         if ($(".full_sent").is(":visible")) {
         $(".full_sent").hide();
         $("#"+full_sent_id).show();
         } else {
         $("#"+full_sent_id).slideDown();
         }
         $(".sent_source").slideUp();
    });
};

function report_click() {
  $('#report_button').bind('click', function() {
    var report_text = "<p><b>Report</b></p><p>Please select the type of error you would like to report:</p><p><span class='error_type'>Linguistic</span><span class='error_type'>Visualisation</span><span class='error_type'>Mismatch</span><span class='error_type'>Source</span><span class='error_type'>Typo</span><span class='error_type'>Full sentence</span></p><p><br>Please select all the sentences in which this error occurs using the checkbox at the right end of each result. Make sure all the selected results share the same error or send different reports for each error.</p><p> You have selected <b><span id='errors_count'>0<span></b> sentences</p> <p class='report_error_message'>You can also send us report notifications about general issues of the Polifonia Corpus application in the about section of the page.</p> <button id='error_report_button'>Send report</button>";
    var report_div = "<div id='report_box'><div class='close_report' id='close_report'></div> "+ report_text +"</div>";
    $("#bottom-spacer").append(report_div);
    $('#report_box').slideDown();
    close_report_click();
    select_error_type();
    });
};

function send_report() {
  $('#error_report_button').bind('click', function() {
  var error_type = $('.error_type_active')[0].innerText + " error";
  var final_csv = "";
  var error_message = error_type + " in query: " + currentLemma + ", "+ currentType + ", "+ currentModule + ", " +  currentLang;
  if (currentType == "concept") {
    ref_num = currentConcept - 1;
    concept_num = " (" + ref_num + ")";
    error_message = error_type + " in query: " + currentLemma +", "+ currentType + concept_num + ", "+ currentModule + ", " +  currentLang;
  };
  if (currentType == "entity") {
    ref_num = currentEntity - 1;
    entity_num = " (" + ref_num + ")";
    error_message = error_type + " in query: " + currentLemma +", "+ currentType + entity_num + ", "+ currentModule + ", " +  currentLang;
  };
  var currentCount = checked_rows.length;
    for (let i = 0; i < currentCount; i++) {
        select = checked_rows[i];
        collection_number =  document.getElementById(select).getElementsByClassName("sent_pos")[0];
        collection_ids = document.getElementById(select).getElementsByClassName("sent_id")[0];
        collection_left = document.getElementById(select).getElementsByClassName("sent_left")[0];
        collection_right = document.getElementById(select).getElementsByClassName("sent_right")[0];
        collection_keys = document.getElementById(select).getElementsByClassName("sent_key")[0];
        sentence = "sent_" + collection_number.textContent + "\t" + collection_ids.textContent.trim() + "\t" + collection_left.textContent.trim() + "\t" + collection_keys.textContent.trim() + "\t" + collection_right.textContent.trim() + "\n";
        final_csv+= sentence;
        };
  var timeStamp = new Date($.now());
  var report_message = timeStamp + "\n" + error_message + "\n" + final_csv

  if (final_csv!= "") {
  currentReport = $.getJSON($SCRIPT_ROOT + '/corpus/report', {
    err: report_message,
  }, function(data) {

  });

    $("#report_box").html("<div class='close_report' id='close_report'></div> <p><b>Thanks for reporting.</b></p><p>The issue has been addressed successfully.<br>Your contribution is greatly appreciated.</p><button id='new_report_button' class='new_report_button'>New report</button>");
  }

  new_report_click();
  close_report_click();
    });
};

function select_error_type() {
  $('.error_type').bind('click', function() {
    var error_type = event.target.innerText + " error";
    $('.error_type').removeClass("error_type_active");
    $(event.target).addClass("error_type_active");
    send_report();
  });
};

function new_report_click() {
  $('.new_report_button').bind('click', function() {
       var report_text = "<p><b>Report</b></p><p>Please select the type of error you would like to report:</p><p><span class='error_type'>Linguistic</span><span class='error_type'>Visualisation</span><span class='error_type'>Mismatch</span><span class='error_type'>Source</span><span class='error_type'>Typo</span><span class='error_type'>Full sentence</span></p><p><br>Please select all the sentences in which this error occurs using the checkbox at the right end of each result. Make sure all the selected results share the same error or send different reports for each error.</p><p> You have selected <b><span id='errors_count'>"+ count.toString() + "<span></b> sentences</p> <p class='report_error_message'>You can also send us report notifications about general issues of the Polifonia Corpus application in the about section of the page.</p> <button id='error_report_button'>Send report</button>";
       var report_div = "<div class='close_report' id='close_report'></div> "+ report_text;
       $("#report_box").html(report_div);
       close_report_click();
       select_error_type();
  });
};

function close_full_sent_click() {
    $('.close_full_sent').bind('click', function() {
         $(".full_sent").slideUp();
    });
};

function close_source_click() {
    $('.close_source').bind('click', function() {
         $(".sent_source").slideUp();
    });
};

function close_report_click() {
  $('.close_report').bind('click', function() {
       $("#report_box").slideUp();
  });
};

function concept_click() {
    $('.concept_row').bind('click', function() {
      if(currentRequest != null) {
           currentRequest.abort();
       };
      concept_id = event.target.id;
      $(".stats_row").html("The concept has been found in <b>" + "___" +"</b> sentences.The research is based on the concept defined as: ");
      $(".stats_row").addClass( "small-stats-row");
      $(".selected_concept").toggleClass('selected_concept concept_row');
        // var reg = \d+. n -;
      var reg = /^\d+. /g
      var definition = document.getElementById(concept_id).innerHTML;
      var def = definition.replace(reg, "");
      $("#select").prepend("<div class='concept_row selected_concept'>"+ def +"</div>");
      document.getElementById("select").scroll(0,0);
      document.getElementById("select").classList.add('expand');
      selected_concept_click();
      $("#result").show();
      $("#result").html("<img class='loader' src='static/svg/loader.gif'>");
      $("#select_all").show();
      more_button_clicks = 0;
      currentRequest = $.getJSON($SCRIPT_ROOT + '/corpus/search', {
        a: $('input[name="lemma"]').val(),
        b: $('select[name="module"]').val(),
        c: $('select[name="lang"]').val(),
        d: $('select[name="type"]').val(),
        n: $('input[name="numb"]').val(),
        k: concept_id
      }, function(data) {
        var results = data.result;
        var stats = data.stat;
        var text_rows = filler_text(results);
          currentLemma = $('input[name="lemma"]').val();
          currentModule = $('select[name="module"]').val();
          currentLang = $('select[name="lang"]').val();
          currentType = $('select[name="type"]').val();
          currentNumb = $('input[name="numb"]').val();
          currentConcept = concept_id;
          $("#result").html(text_rows);
          $(".stats_row").html("The concept has been found in <b>" + stats +"</b> sentences. The research is based on the concept defined as: ");
          document.getElementById("more_button").disabled = false;
          document.getElementById("report_button").disabled = false;
          document.getElementById("download_button").disabled = false;
          document.getElementById("download_label").classList.add("download_label-active");
          document.getElementById("select_all").disabled = false;
          source_click();
          sent_click();
          report_click()
          close_full_sent_click();
          close_source_click();
      });
      return false;
    });
};

function selected_concept_click() {
    $('.selected_concept').bind('click', function() {
      document.getElementById("select").classList.remove('expand');
      $(".selected_concept").remove()
      $(".concept_row").css("display", "block");
      return false;
    });
};

function entity_click() {
    $('.entity_row').bind('click', function() {
      if(currentRequest != null) {
           currentRequest.abort();
       };
      entity_id = event.target.id;
      $(".stats_row").html("The entity has been found in <b>" + "__" +"</b> sentences. The research is based on the entity defined as: ");
      $(".stats_row").addClass( "small-stats-row");
      $(".selected_entity").toggleClass('selected_entity entity_row');
      var reg = /^\d+./g;
      var definition = document.getElementById(entity_id).innerHTML;
      var def = definition.replace(reg, "");
      $("#select").prepend("<div class='entity_row selected_entity'>"+ def +"</div>");
      document.getElementById("select").scroll(0,0);
      document.getElementById("select").classList.add('expand');
      selected_entity_click();
      $("#result").show();
      $("#result").html("<img class='loader' src='static/svg/loader.gif'>");
      $("#select_all").show();
      more_button_clicks = 0;
      currentRequest = $.getJSON($SCRIPT_ROOT + '/corpus/search', {
        a: $('input[name="lemma"]').val(),
        b: $('select[name="module"]').val(),
        c: $('select[name="lang"]').val(),
        d: $('select[name="type"]').val(),
        n: $('input[name="numb"]').val(),
        e: entity_id
      }, function(data) {
        var results = data.result;
        var stats = data.stat;
        var text_rows = filler_text(results);
          currentLemma = $('input[name="lemma"]').val();
          currentModule = $('select[name="module"]').val();
          currentLang = $('select[name="lang"]').val();
          currentType = $('select[name="type"]').val();
          currentNumb = $('input[name="numb"]').val();
          currentEntity = entity_id;
          $("#result").html(text_rows);
          $(".stats_row").html("The entity has been found in <b>" + stats +"</b> sentences. The research is based on the entity defined as: ");
          document.getElementById("more_button").disabled = false;
          document.getElementById("report_button").disabled = false;
          document.getElementById("download_button").disabled = false;
          document.getElementById("download_label").classList.add("download_label-active");
          document.getElementById("select_all").disabled = false;
          source_click();
          sent_click();
          report_click()
          close_full_sent_click();
          close_source_click();
      });
      return false;
    });
};

function selected_entity_click() {
    $('.selected_entity').bind('click', function() {
      document.getElementById("select").classList.remove('expand');
      $(".selected_entity").remove()
      $(".entity_row").css("display", "block");
      return false;
    });
};

// Checkboxes

function doCheck(checkboxElem) {
     check_id = event.target.id;
     document.getElementById("view_button").disabled = false;
     row_id = check_id.replace('check_','row')
  if (checkboxElem.checked) {
     document.getElementById("view_label").classList.add("view_label-active");
     if (!checked_rows.includes(row_id)) { checked_rows.push(row_id); };
     document.getElementById(row_id).classList.add('selected_row');
     document.getElementById(row_id).classList.remove('sent_row');
     count = checked_rows.length
     document.getElementById("entrance_view").setAttribute('data-before', count.toString());
     document.getElementById("selected-download-main").innerHTML = "Save Selected ("+ count.toString()+")";
     if (document.getElementById("errors_count")) {
      document.getElementById("errors_count").innerHTML = count.toString();
    }; 
     document.getElementById("selected_download").innerHTML = "Selected ("+ count.toString() +")";
     if (checked_rows.length == currentNumb) {
     document.getElementById("view_button").disabled = true;
     };
  } else {
     checked_rows = checked_rows.filter(e => e !== row_id);
     document.getElementById(row_id).classList.add('sent_row');
     document.getElementById(row_id).classList.remove('selected_row');
     $("#select_all").prop('checked', false);
     count = checked_rows.length
     document.getElementById("selected-download-main").innerHTML = "Save Selected ("+ count.toString()+")";
     if (document.getElementById("errors_count")) {
      document.getElementById("errors_count").innerHTML = count.toString();
    }; 
     document.getElementById("entrance_view").setAttribute('data-before', count.toString());
     if (checked_rows.length < 1) {
        document.getElementById("view_button").disabled = true;
        document.getElementById("entrance_view").setAttribute('data-before', "");
        document.getElementById("view_label").classList.remove("view_label-active");
        };
  }
};

function doCheckAll(checkboxElem) {
  if (checkboxElem.checked) {
      $("#result :input").prop('checked', false);
      $("#result :input").trigger("click");
      document.getElementById("view_button").disabled = true;
  } else {
   $("#result :input").trigger("click");
  }
};



// My view
var view_count = 1;

function my_view(){
    if(view_count == 1){
        [].forEach.call(document.querySelectorAll('.sent_row'), function (el) {el.style.display = 'none';});
        document.getElementById("view_button").classList.add('view_button-active');
        document.getElementById("more_button").disabled = true;
        document.getElementById("report_button").disabled = true;
        document.getElementById("select_all").disabled = true;
        var last_selected = $('.selected_row:visible:last');
        last_selected.after( "<div class='view_divisor' style='border-top:0.5px solid black;'></div>" );
        view_count = 0;
    }else{
        [].forEach.call(document.querySelectorAll('.sent_row'), function (el) {el.style.display = 'block';});
        document.getElementById("view_button").classList.remove('view_button-active');
        document.getElementById("more_button").disabled = false;
        document.getElementById("report_button").disabled = false;
        document.getElementById("select_all").disabled = false;
        $('.view_divisor').remove();
        view_count = 1;
    }
};


// Dropdown test
var dropdown_dwn = 1;

function dropDown(){
    if(dropdown_dwn == 0){
        document.getElementById("download_button").classList.remove('download_button-active');
        document.getElementById("download_dropdown").style.display="none";
        $("#download_dropdown-2").hide();
        $("#download_dropdown-1").hide();
        dropdown_dwn = 1;
    }else{
        document.getElementById("download_button").classList.add('download_button-active');
        document.getElementById("download_dropdown").style.display="block";
        $("#selected-download-main").show();
        $("#all-download-main").show();
        $("#download_dropdown-2").hide();
        $("#download_dropdown-1").hide();
        dropdown_dwn = 0;
    }
};

function showOptionsAll() {
    $("#selected-download-main").hide();
    $("#all-download-main").hide();
    $("#download_dropdown-1").show();
    $("#download_dropdown-2").hide();
}

function showOptionsSel() {
    $("#selected-download-main").hide();
    $("#all-download-main").hide();
    $("#download_dropdown-1").hide();
    $("#download_dropdown-2").show();
}

// Change select options (type)

var dropdown_dwn_type = 1;

function dropDownType(){
    if(dropdown_dwn_type == 0){
        document.getElementById("type_dropdown").style.display="none";
        $("#type").removeClass( "type_active");
        $('#type').blur();
        $('.option_type').removeClass( "option_type_last");
        dropdown_dwn_type = 1;
    }else{
        document.getElementById("type_dropdown").style.display="block";
        const $select = document.querySelector('#type');
        var select_id = "option_type-" + $select.value;
        $("#"+select_id).hide();
        $("#type").addClass( "type_active");
        $('#type').blur();
        var last_option = $('.option_type:visible:last');
        last_option.addClass( "option_type_last");
        dropdown_dwn_type = 0;
    }
};


function changeType(value) {
    const $select = document.querySelector('#type');
    var select_id = "option_type-" + $select.value;
    $("#"+select_id).show();
    $select.value = value;
    $("#type_dropdown").hide();
    $("#type").removeClass( "type_active");
    $('.option_type').removeClass( "option_type_last");
    dropdown_dwn_type = 1;
}


// Change select options (module)

var dropdown_dwn_module = 1;

function dropDownModule(){
    if(dropdown_dwn_module == 0){
        document.getElementById("module_dropdown").style.display="none";
        $("#module").removeClass( "module_active");
        $('#module').blur();
        $('.option_module').removeClass( "option_module_last");
        dropdown_dwn_module = 1;
    }else{
        document.getElementById("module_dropdown").style.display="block";
        const $select = document.querySelector('#module');
        var select_id = "option_module-" + $select.value;
        $("#"+select_id).hide();
        $("#module").addClass( "module_active");
        $('#module').blur();
        var last_option = $('.option_module:visible:last');
        last_option.addClass( "option_module_last");
        dropdown_dwn_module = 0;
        pilotsBack();
    }
};
var statsAll = ["624.117", "24.173.326", "450.861.842", "179.224.624", "128.905.937"]
var statsWikipedia = ["542.855","15.766.277","433.027.712","13.087.096","112.237.539","42.295.944" ];
var statsBooks = ["54.238","1.772.330","4.408.724","40.315.179", "1.939.962",""]
var statsPeriodicals = ["5.753", "5.558.134", "10.969.779",	"98.628.040", "5.329.951",""];

var statsPilotsBells = ["59","18.481","128.161","434.439", "128.708",""];
var statsPilotsChild = ["30","157.815","361.550","3.442.840", "1.245.916",""];
var statsPilotsMeetups = ["19.476","822.861","1.631.371","21.536.135", "7.534.211",""];
var statsPilotsMusicbo = ["46","51.781","289.247","1.412.456", "420.849",""];
var statsPilotsOrgans = ["1.660","25.647","45.298","368.439", "68.801",""];

function changeStats(value) {
    for (i = 1; i <= value.length; i++) {
        var reg = /\./g;
        var moduleValue = value[i-1];
        var cleanText = moduleValue.replace(reg, "</span>.<span class='count'>");
        var finalText = "<span class='count'>" + cleanText + "</span>";
        $('#count_stat_'+ i).html(finalText);
    }
    animateCount();
}

/*Automplete lexicon*/

var lexiconEN = ['lemmata', 'twelve-tone music', '12-tone music', 'twelve-tone system', '12-tone system', 'a cappella singing', 'a capella singing', 'absolute pitch', 'perfect pitch', 'accidental', 'accompaniment', 'musical accompaniment', 'backup', 'support', 'accompanist', 'accompanyist', 'accordion', 'piano accordion', 'squeeze box', 'accordionist', 'psychedelic rock', 'acid rock', 'gramophone', 'acoustic gramophone', 'acoustic guitar', 'adagio', 'arranger', 'adapter', 'transcriber', 'borrowing', 'adoption', 'aeolian harp', 'aeolian lyre', 'wind harp', 'aficionado', 'black music', 'African-American music', 'tune', 'melody', 'air', 'strain', 'melodic line', 'line', 'melodic phrase', 'album', 'record album', 'alla breve', 'allegretto', 'allegro', 'alto', 'contralto', 'countertenor', 'alto clef', 'viola clef', 'alto saxophonist', 'altoist', 'Amati', 'American organ', 'nonlinear distortion', 'amplitude distortion', 'entertainment', 'amusement', 'andante', 'anthem', 'hymn', 'antiphon', 'antiphony', 'applause', 'hand clapping', 'clapping', 'aria', 'arietta', 'short aria', 'arioso', 'arpeggio', 'musical arrangement', 'arrangement', 'arranging', 'transcription', 'progressive rock', 'art rock', 'atonality', 'atonalism', 'audio', 'sound', 'sound recording', 'audio recording', 'audio system', 'sound system', 'audiotape', 'audition', 'tryout', 'auditory perception', 'sound perception', 'auditory sensation', 'record changer', 'auto-changer', 'changer', 'avant-garde', 'vanguard', 'van', 'new wave', 'backbeat', 'bagatelle', 'bagpipe', 'piper', 'bagpiper', 'balalaika', 'ballad', 'lay', 'songwriter', 'songster', 'ballad maker', 'ballade', 'crooner', 'balladeer', 'ballet', 'dance music', 'danceroom music', 'ballroom music', 'bang', 'clap', 'eruption', 'blast', 'bam', 'band', 'dance band', 'dance orchestra', 'bandleader', 'bandmaster', 'bandoneon', 'bandsman', 'banging', 'scolion', 'banquet song', 'measure', 'bar', 'bar line', 'barbershop quartet', 'barcarole', 'barcarolle', 'baritone', 'barytone', 'baritone voice', 'baritone horn', 'barrel organ', 'grind organ', 'hand organ', 'hurdy gurdy', 'hurdy-gurdy', 'street organ', 'bass', 'bass part', 'basso', 'bass voice', 'bass clarinet', 'bass clef', 'F clef', 'bass drum', 'gran casa', 'bass fiddle', 'bass viol', 'bull fiddle', 'double bass', 'contrabass', 'string bass', 'bass guitar', 'viola da gamba', 'gamba', 'basset horn', 'heckelphone', 'basset oboe', 'bassist', 'figured bass', 'basso continuo', 'continuo', 'thorough bass', 'bassoonist', 'baton', 'wand', 'rhythm', 'beat', 'musical rhythm', 'bop', 'bebop', 'beguine', 'bel canto', 'bell ringer', 'tribute album', 'benefit album', 'benefit concert', 'lullaby', 'cradlesong', 'berceuse', 'big band', 'blare', 'blaring', 'cacophony', 'clamor', 'din', 'blue note', 'bluegrass', 'blues', 'bolero', 'bombardon', 'bombard', 'bones', 'castanets', 'clappers', 'finger cymbals', 'boogie', 'boogie-woogie', 'script', 'book', 'playscript', 'ghetto blaster', 'boom box', 'comic opera', 'opera bouffe', 'bouffe', 'opera comique', 'drone', 'drone pipe', 'bourdon', 'brass section', 'brass', 'brass band', 'bravura', 'hubbub', 'uproar', 'brouhaha', 'katzenjammer', 'fan', 'buff', 'devotee', 'lover', 'bugler', 'country music', 'country and western', 'C and W', 'C clef', 'cabaret', 'floorshow', 'floor show', 'cadence', 'cadenza', 'cakewalk', 'calliope', 'steam organ', 'canary', 'canon', 'cantata', 'oratorio', 'canticle', 'choirmaster', 'precentor', 'cantor', 'cantus firmus', 'capriccio', 'carillonneur', 'carioca', 'caroler', 'caroller', 'caroling', 'sleigh bell', 'cascabel', 'cassette deck', 'castrato', 'celesta', 'cellist', 'violoncellist', 'cello', 'violoncello', 'chamber music', 'chamber orchestra', 'chant', 'chanter', 'melody pipe', 'chantey', 'chanty', 'sea chantey', 'shanty', 'intonation', 'chanting', 'chatter', 'chattering', 'chest register', 'chest voice', 'chest tone', 'choir', 'consort', 'choirboy', 'chorale prelude', 'chorister', 'chorus', 'refrain', 'Greek chorus', 'chromatic scale', 'religious music', 'church music', 'cittern', 'cithern', 'cither', 'citole', 'gittern', 'clack', 'clang', 'clangor', 'clangour', 'clangoring', 'clank', 'clash', 'crash', 'clarinetist', 'clarinettist', 'classical music', 'classical', 'serious music', 'clatter', 'clavichord', 'clavier', 'Klavier', 'clef', 'finale', 'close', 'closing curtain', 'finis', 'coda', 'color', 'colour', 'coloration', 'colouration', 'coloratura', 'coloratura soprano', 'jazz band', 'jazz group', 'combo', 'comeback', 'disturbance', 'disruption', 'commotion', 'flutter', 'hurly burly', 'to-do', 'hoo-ha', 'hoo-hah', 'kerfuffle', 'composer', 'composing', 'composition', 'musical composition', 'opus', 'piece', 'piece of music', 'concept album', 'concert', 'concert band', 'military band', 'concert pitch', 'philharmonic pitch', 'international pitch', 'polyphony', 'polyphonic music', 'concerted music', 'concertina', 'concerto', 'concerto grosso', 'conducting', 'conductor', 'music director', 'director', 'conga', 'conga line', 'contrabassoon', 'contrafagotto', 'double bassoon', 'contrapuntist', 'cool jazz', 'English horn', 'cor anglais', 'trumpeter', 'cornetist', 'counterpoint', 'courante', 'cover', 'cover version', 'cover song', 'creak', 'creaking', 'crescendo', 'crooning', 'crossover', 'quarter note', 'crotchet', 'cut', 'track', 'cymbalist', 'danse macabre', 'dance of death', 'digital audiotape', 'DAT', 'funeral march', 'dead march', 'decrescendo', 'diminuendo', 'descant', 'discant', 'development', 'diatonic scale', 'Dies Irae', 'diminution', 'ding-dong', 'phonograph record', 'phonograph recording', 'record', 'disk', 'disc', 'platter', 'disk jockey', 'disc jockey', 'dj', 'disco', 'disco music', 'noise', 'dissonance', 'racket', 'distortion', 'ditty', 'prima donna', 'diva', 'divertimento', 'serenade', 'doo-wop', 'double bar', 'downbeat', 'drinking song', 'drum major', 'drum majorette', 'majorette', 'paradiddle', 'roll', 'drum roll', 'rub-a-dub', 'rataplan', 'drumbeat', 'drummer', 'rehearsal', 'dry run', 'dub', 'duet', 'duette', 'duo', 'eightsome', 'electric guitar', 'electric organ', 'electronic organ', 'Hammond organ', 'organ', 'electronic instrument', 'electronic musical instrument', 'encore', 'enigma canon', 'enigmatic canon', 'enigmatical canon', 'riddle canon', 'ensemble', 'episode', 'folk music', 'ethnic music', 'folk', 'etude', 'euphonium', 'music', 'euphony', 'eurythmy', 'eurhythmy', 'eurythmics', 'eurhythmics', 'explosion', 'exposition', 'extemporization', 'extemporisation', 'improvisation', 'fado', 'falsetto', 'flourish', 'fanfare', 'tucket', 'fantasia', 'fermata', 'violin', 'fiddle', 'violinist', 'fiddler', 'fife', 'fipple flute', 'fipple pipe', 'recorder', 'vertical flute', 'hiss', 'hissing', 'hushing', 'fizzle', 'sibilation', 'flamenco', 'flat', 'flutist', 'flautist', 'flute player', 'flugelhorn', 'fluegelhorn', 'folk song', 'folksong', 'folk ballad', 'forte', 'fortissimo', 'piano', 'pianoforte', 'forte-piano', 'fugue', 'funk', 'treble clef', 'treble staff', 'G clef', 'gambist', 'gamelan', 'gamut', 'gapped scale', 'tumult', 'tumultuousness', 'garboil', 'gavotte', 'music genre', 'musical genre', 'genre', 'musical style', 'gestalt', 'gig', 'jig', 'gigue', 'glee club', 'glissando', 'glockenspiel', 'orchestral bells', 'oldie', 'golden oldie', 'gospel', 'gospel singing', 'gradual', 'grand opera', 'grate', 'plainsong', 'plainchant', 'Gregorian chant', 'grinding', 'ground bass', 'groupie', 'rumble', 'rumbling', 'grumble', 'grumbling', 'grunt', 'oink', 'Guarnerius', 'guitar', 'guitar pick', 'guitarist', 'guitar player', 'habanera', 'half rest', 'hallelujah', 'mallet', 'hammer', 'Hammerstein', 'Oscar Hammerstein', 'Oscar Hammerstein II', 'Hampton', 'Lionel Hampton', 'hand', 'handclap', 'Hare Krishna', 'harmonic', 'harmonization', 'harmonisation', 'harmonizer', 'harmoniser', 'harmonium', 'reed organ', 'harmony', 'musical harmony', 'harp', 'harpist', 'harper', 'harpsichordist', 'oboe', 'hautboy', 'hautbois', 'Hawaiian guitar', 'steel guitar', 'head register', 'head voice', 'head tone', 'heavy metal', 'heavy metal music', 'hi-fi', 'high fidelity sound system', 'highland fling', 'hillbilly music', 'rap', 'rap music', 'hip-hop', 'homophony', 'hornist', 'hornpipe', 'hosanna', 'hot jazz', 'howl', 'hum', 'humming', 'hummer', 'hush', 'stillness', 'still', 'psalmody', 'hymnody', 'theme', 'melodic theme', 'musical theme', 'idea', 'pastorale', 'pastoral', 'idyll', 'idyl', 'impromptu', 'incidental music', 'instrumental music', 'musician', 'instrumentalist', 'player', 'instrumentation', 'orchestration', 'intermezzo', 'intro', 'introit', 'inversion', 'iPod', 'jam session', 'jingle', 'jangle', 'jazz', 'jazz musician', 'jazzman', "jew's harp", "jews' harp", 'mouth bow', 'swing', 'swing music', 'jive', 'juke', 'jook', 'juke joint', 'jook joint', 'juke house', 'jook house', 'jug band', 'karaoke', 'kazoo', 'kettle', 'kettledrum', 'tympanum', 'tympani', 'timpani', 'key', 'tonality', 'keyboard instrument', 'keyboardist', 'knell', 'koto', 'koto player', 'kwela', 'LP', 'L-P', 'lagerphone', 'landler', 'larghetto', 'largo', 'lead sheet', 'ledger line', 'leger line', 'leitmotiv', 'leitmotif', 'libretto', 'lied', 'lieder singer', 'operetta', 'light opera', 'lilt', 'litany', 'love song', 'love-song', 'lutist', 'lutanist', 'lutenist', 'lyre', 'lyricality', 'lyricism', 'songfulness', 'macumba', 'madrigal', 'madrigalist', 'major scale', 'major diatonic scale', 'mambo', 'mandola', 'maraca', 'marching music', 'march', 'marching band', 'mariachi', 'marimba', 'xylophone', 'Marseillaise', 'military march', 'military music', 'martial music', 'Mass', 'mazurka', 'mechanical piano', 'Pianola', 'player piano', 'medley', 'potpourri', 'pastiche', 'melodiousness', 'tunefulness', 'tonal pattern', 'meno mosso', 'metalhead', 'meter', 'metre', 'time', 'metronome', 'mezzo-soprano', 'mezzo', 'minor scale', 'minor diatonic scale', 'minstrelsy', 'minuet', 'modern jazz', 'new jazz', 'neo jazz', 'transition', 'modulation', 'monophony', 'monophonic music', 'monody', 'moonwalk', 'morceau', 'motet', 'motif', 'motive', 'movement', 'musette pipe', 'music box', 'musical box', 'music critic', 'music stand', 'music rack', 'musical chairs', 'musical drama', 'musical organization', 'musical organisation', 'musical group', 'musical notation', 'note', 'musical note', 'tone', 'passage', 'musical passage', 'musical perception', 'musical performance', 'phrase', 'musical phrase', 'scale', 'musical scale', 'score', 'musical score', 'time signature', 'musical time signature', 'musicality', 'musicalness', 'mute', 'nasality', 'national anthem', 'spiritual', 'Negro spiritual', 'nocturne', 'notturno', 'obbligato', 'obligato', "oboe d'amore", 'oboe da caccia', 'oboist', 'octet', 'octette', 'upbeat', 'offbeat', 'opera', 'opera star', 'operatic star', 'orchestra', 'orchestra pit', 'pit', 'pipe organ', 'organist', 'ostinato', 'ovation', 'standing ovation', 'overture', 'tempo', 'pacing', 'virginal', 'pair of virginals', 'panpipe', 'pandean pipe', 'syrinx', 'pant', 'part', 'voice', 'part-singing', 'part music', 'partita', 'partsong', 'paso doble', 'pavane', 'pavan', 'payola', 'pedal point', 'pedal', 'pennywhistle', 'tin whistle', 'whistle', 'pentatonic scale', 'pentatone', 'percussion section', 'percussion', 'rhythm section', 'percussionist', 'symphony orchestra', 'symphony', 'philharmonic', 'record player', 'phonograph', 'pianissimo', 'pianist', 'piano player', 'piano lesson', 'piano music', 'piano sonata', 'pipe', 'pipe major', 'pitch pipe', 'pizzicato', 'splash', 'plash', 'playlist', 'play list', 'playback', 'playing', 'plonk', 'plop', 'plump', 'polka', 'polytonality', 'polytonalism', 'pop music', 'pop', 'pop group', 'popular music', 'popular music genre', 'popularism', 'postlude', 'prelude', 'preparation', 'primo', 'processional', 'prosodion', 'processional march', 'recessional march', 'program music', 'programme music', 'psalmist', 'punk rocker', 'punk', 'punk rock', 'pure tone', 'quadraphony', 'quadraphonic system', 'quadriphonic system', 'quadrille', 'timbre', 'timber', 'quality', 'quarter rest', 'quartet', 'quartette', 'quickstep', 'silence', 'quiet', 'quintet', 'quintette', 'rhythm and blues', 'R and B', 'ragtime', 'rag', 'rattle', 'rattling', 'rale', 'rapper', 'rat-a-tat-tat', 'rat-a-tat', 'rat-tat', 'rave', 'realization', 'realisation', 'rearrangement', 'recapitulation', 'recital', 'recitalist', 'recitative', 'record company', 'record sleeve', 'record cover', 'recorder player', 'recording studio', 'recording system', 'reed section', 'reel', 'Scottish reel', 'reggae', 'register', 'reharmonization', 'reharmonisation', 'release', 'religious song', 'reproduction', 'replication', 'report', 'reproducer', 'Requiem', 'resolution', 'resonance', 'rest', 'rumba', 'rhumba', 'rhythm and blues musician', 'riff', "rock 'n' roll", "rock'n'roll", 'rock-and-roll', 'rock and roll', 'rock', 'rock music', 'rocker', "rock 'n' roll musician", 'rock group', 'rock band', 'rock concert', 'rock opera', 'rock star', 'rockabilly', 'rondo', 'rondeau', 'roulade', 'round', 'troll', 'roundelay', 'royalty', 'rubato', 'rustle', 'rustling', 'whisper', 'whispering', 'sackbut', 'samba', 'samisen', 'shamisen', 'saraband', 'saxophonist', 'saxist', 'scat', 'scat singing', 'scene', 'scherzo', 'schottische', 'scrape', 'scraping', 'scratch', 'scratching', 'screech', 'screeching', 'shriek', 'shrieking', 'scream', 'screaming', 'scrunch', 'secondo', 'section', 'subdivision', 'segno', 'septet', 'septette', 'sequence', 'serialism', 'serial music', 'sextet', 'sextette', 'sestet', 'sforzando', 'trill', 'shake', 'sharp', 'shawm', 'sheet music', 'shrilling', 'shrillness', 'stridence', 'stridency', 'snare drum', 'snare', 'side drum', 'signature', 'signature tune', 'theme song', 'singalong', 'singsong', 'singer', 'vocalist', 'vocalizer', 'vocaliser', 'singing', 'vocalizing', 'singing voice', 'sitar player', 'sizzle', 'skank', 'skiffle', 'skiffle group', 'slam', 'slam dancing', 'slam dance', 'swoop', 'slide', 'snap', 'tonic solfa', 'solfa', 'solmization', 'solfege', 'solfeggio', 'solmisation', 'solo', 'soloist', 'sonata', 'sonata form', 'sonatina', 'song', 'vocal', 'soprano', 'soprano clef', 'sourdine', 'sordino', 'soul', 'sound effect', 'sound reproduction', 'spatter', 'spattering', 'splatter', 'splattering', 'sputter', 'splutter', 'sputtering', 'sprechgesang', 'sprechstimme', 'square-dance music', 'squawk', 'squish', 'staff', 'stave', 'statement', 'steel band', 'stereo', 'stereophony', 'stereo system', 'stereophonic system', 'Stradavarius', 'Strad', 'string orchestra', 'string quartet', 'string quartette', 'string section', 'strings', 'study', 'stylus', 'suite', 'supertitle', 'surtitle', 'swell', 'symphonic music', 'symphonic poem', 'tone poem', 'symphonist', 'syncopation', 'syncopator', 'synthesizer', 'synthesiser', "Ta'ziyeh", 'tablature', 'tambourine', 'tango', 'tape', 'tape recording', 'taping', 'tape recorder', 'tape machine', 'tapping', 'tarantella', 'tarantelle', 'techno', 'tenor', 'tenor voice', 'tenor clef', 'tenor saxophonist', 'tenorist', 'texture', 'theremin', 'thrush', 'tympanist', 'timpanist', 'toccata', 'torch singer', 'torch song', 'tra-la', 'tra-la-la', 'trad', 'tremolo', 'triangle', 'trio', 'triple time', 'trombonist', 'trombone player', 'trumpet section', 'twist', 'uke', 'ukulele', 'vamp', 'variation', 'vibist', 'vibraphonist', 'vibrato', 'Victrola', 'viol', 'viola', "viola d'amore", 'viola da braccio', 'violin section', 'violist', 'virtuoso', 'vocal music', 'voice part', 'voicing', 'voluntary', 'Walkman', 'waltz', 'warbler', 'wedding march', 'whistling', 'whole rest', 'wire recorder', 'work song', 'xylophonist', 'yodeling', 'yodeller', 'zill', 'zydeco', 'play along', 'accompany', 'follow', 'bang out', 'drum', 'thrum', 'beat out', 'tap out', 'thump out', 'blaze away', 'brattle', 'bugle', 'busk', 'intone', 'intonate', 'cantillate', 'chord', 'harmonize', 'harmonise', 'chug', 'compose', 'write', 'crack', 'whine', 'squeak', 'screak', 'skreak', 'croon', 'yodel', 'warble', 'descant on', 'disk-jockey', 'disc-jockey', 'DJ', 'flatten', 'drop', 'plank', 'flump', 'plunk', 'plump down', 'plunk down', 'quieten', 'quiesce', 'quiet down', 'pipe down', 'instrument', 'instrumentate', 'invert', 'make noise', 'resound', 'melodize', 'melodise', 'misplay', 'orchestrate', 'play', 'spiel', 'prepare', 'sough', 'purl', 'quaver', 'realize', 'realise', 'reharmonize', 'reharmonise', 'replay', 'set to music', 'sharpen', 'sightsing', 'sight-sing', 'sing', 'sing along', 'skirl', 'splosh', 'slosh', 'slush', 'slur', 'symphonize', 'symphonise', 'syncopate', 'tape record', 'transcribe', 'transpose', 'a cappella', 'accompanied', 'attended', 'antiphonary', 'antiphonal', 'ariose', 'songlike', 'atonalistic', 'Beethovenian', 'cantabile', 'chantlike', 'intoned', 'choral', 'chromatic', 'diatonic', 'dirty', 'soiled', 'unclean', 'unresolved', 'dissonant', 'euphonious', 'euphonous', 'first', 'funky', 'low-down', 'homophonic', 'increasing', 'jazzy', 'keyed', 'larghissimo', 'lentissimo', 'lento', 'lilting', 'swinging', 'swingy', 'tripping', 'lyric', 'lyrical', 'major', 'mensural', 'measured', 'mensurable', 'melodious', 'melodic', 'musical', 'tuneful', 'minor', 'monodic', 'monodical', 'monophonic', 'natural', 'noiseless', 'pianistic', 'soft', 'pitched', 'polyphonic', 'polyphonous', 'polytonal', 'rackety', 'rip-roaring', 'uproarious', 'reedy', 'wheezy', 'second', 'shrill', 'silent', 'soundless', 'singable', 'slow', 'soft-footed', 'tonal', 'tonic', 'unaccompanied', 'unmelodious', 'unmelodic', 'unmusical', 'Wagnerian', 'accelerando', 'chorally', 'harmonically', 'legato', 'slowly', 'noiselessly', 'soundlessly', 'very softly', 'shrilly', 'piercingly', 'presto', 'quietly', 'raucously', 'staccato'];
var lexiconIT = ['clavicembalo', 'pianoforte', 'piano', '33 giri', 'ellepi', 'l.p.', 'long-playing', 'long playing', 'long play', 'lp', 'microsolco', 'trentatre giri', 'a cappella', 'a solo', 'assolo', 'abbassare', 'accelerando', 'accidente', 'alterazione', 'acclamazione', 'applauso', 'battere le mani', 'battimani', 'battimano', 'ovazione', 'plauso', 'accompagnamento', 'accompagnamentoimprovvisato', 'accompagnare', 'accompagnato', 'accompagnatore', 'accordare', 'armonizzare', 'concertare', 'intonare', 'accordato', 'acid-rock', 'acid rock', 'musica psichedelica', 'psychedelic rock', 'rock psichedelico', 'acutezza', 'acuto', 'stridente', 'stridula', 'stridulo', 'adagio', 'adattamento', 'arrangiamento musicale', 'arrangiamenti', 'arrangiamento', 'arrangiatore', 'arrangiatrice', 'riduzione', 'adozione', 'aficionado', 'amante', 'amatore', 'ammiratore', 'appassionato', 'entusiasta', 'fan', 'patito', 'habitué', 'agitazione', 'commozione', 'fermento', 'kerfuffle', 'rivolgimento', 'sconvolgimento', 'sommovimento', 'tumulto', 'turbamento', 'album discografici', 'album discografico', 'album in studio', 'album musicale', 'album musicali', 'album studio', 'album', 'raccolta musicale', 'album tematico', 'concept-album', 'concept album', 'album tributo', 'alla breve', 'allegretto', 'allegro', 'alleluia', 'alleluja', 'halleluia', 'halleluyah', 'lodate iah', 'alto', 'contralto', 'altosassofonista', 'alzare di un semitono', 'am pop', 'musica commerciale', 'musica pop', 'musica semplice', 'pop-classica', 'pop band', 'pop music', 'pop', 'amante della musica', 'appassionato di musica', 'melomane', 'musica', 'Amati', 'amelodico', 'andante', 'anthem', 'inno', 'antifona', 'antifonale', 'antifonia', 'aria', 'canto', 'linea melodica', 'melodia', 'melodie', 'arietta', 'motivetto', 'arioso', 'armonia', 'armonica', 'marranzano', 'murchanga', 'scacciapensieri', 'armonicamente', 'armoniosamente', 'musicalmente', 'armonici', 'suoni armonici', 'armonico', 'armonioso', 'intonato', 'melodioso', 'musicale', 'armonium', 'armonio', 'harmonium', 'organo a pompa', 'organo ad aria compressa', 'armonizzazione', 'arpa', 'arpe', 'arpa eolia', 'arpeggiatore', 'arpista', "suonatore d'arpa", 'arpeggio', 'trascrizione', 'articolazione', 'articolo', 'sezione', 'art-rock', 'art rock', 'musica progressive', 'prog-rock', 'prog rock', 'progressive rock', 'progressive', 'prog', 'rock progressive', 'rock progressivo', 'assestamento', 'assesto', 'assettamento', 'regolazione', 'riarrangiamento', 'riassestamento', 'riassetto', 'rimpasto', 'riordinamento', 'riordinazione', 'atonale', 'dodecafonia', 'musica atonale', 'atonalità', 'audio', 'impianto audio', 'suono', 'audizione', 'provino', 'auleta', 'aulete', 'flautista', 'suonatore di flauto', 'aumentare', 'autopiano', 'piano meccanico', 'pianoforte automatico', 'pianoforte meccanico', 'pianola', 'autore', 'compositore', 'compositori', 'compositrice', 'musicista', 'avanguardia artistica', 'avanguardie storiche', 'avanguardismo', 'avanguardia', 'avanguardie', 'avant-garde', 'avant garde', "pittura d'avanguardia", 'baccano', 'bailamme', 'baraonda', 'bolgia', 'bordello', 'buriana', 'caciara', 'cagnara', 'canea', 'chiasso', 'clamore', 'fracasso', 'fragore', 'frastuono', 'gazzarra', 'parapiglia', 'sarabanda', 'schiamazzo', 'strepito', 'casino', 'confusione', 'trambusto', "bacchetta del direttore d'orchestra", 'bacchette', 'mallet', 'mazzolo', 'mazzuola', 'mazzuolo', 'backslide', 'moon walk', 'moonwalking', 'moonwalk', 'badinage', 'badinerie', 'scherzo', 'bagatella', 'bagattella', 'diavolio', 'putiferio', 'balalaica', 'balalaika', 'baldoria', 'orgia', 'rave', 'ballabile', 'musica da ballo', 'ballare il jive', 'ballata', 'ballerino di flamenco', 'flamenco', 'balletto', 'band', 'complesso', 'ensemble musicale', 'gruppo musicale', 'bandadistrumentiapercusiionetipicidellaAntille', 'banda', 'orchestra da ballo', 'orchestrina', 'banda da concerto', 'banda sinfonica', 'complesso bandistico', 'corpi bandistici militari', 'fanfara', 'musica per strumenti a fiato', 'orchestra di fiati', 'orchestre di fiati', 'banda militare', 'banda di ottoni', 'brass band', 'banda jazz', 'gruppo jazz', 'bandista', 'musicante', 'bandoneonista', 'bandoneon', 'bandoneón', 'bang', 'botta', 'botto', 'bum', 'colpo', 'percussione', 'scoppio', 'squillo', 'barcarola', 'baritono', 'vocedibaritono', 'bass drum', 'doppia cassa', 'doppio pedale', 'gran cassa', 'grancassa', 'bassista', 'basso', 'base', 'voce di basso', 'parte di basso', 'basso cifrato', 'basso numerato', 'basso elettrico', 'chitarra basso', 'basso ostinato', 'battere', 'colpire', 'in battere', 'levare', 'ritmo musicale', 'ritmi', 'ritmo', 'tempo', 'picchiettare', 'batterista', 'tamburino', 'tamburo', 'battitodimani', 'battuta musicale', 'battuta', 'misura', 'compás', 'be-bop', 'be bop', 'bebop', 'bop', 'beethoveniano', 'beguine', 'belcanto', 'bel canto', 'belcantismo', 'bemolle', 'berceuse', 'cantilena', 'ninna-nanna', 'ninna nanna', 'ninnananna', 'big bands', 'big band', 'orchestra jazz', 'bis', 'bisbiglio', 'fremito', 'fruscio', 'mormorio', 'parlottio', 'sussurro', 'fruscìo', 'bitonalità', 'politonalità', 'black music', 'musica afro-americana', 'musica afroamericana', 'musica nera', 'race music', 'blue note', 'bluegrass music', 'bluegrass', 'musica bluegrass', 'blues', 'boato', 'borbogliamento', 'brontolamento', 'rimbombo', 'rombo', 'rumoreggiamento', 'rumorio', 'sferragliamento', 'boe da caccia', 'bolero latino americano', 'bolero', 'bombarda', 'bombardino', 'flicorno baritono', 'flicorno soprano', 'flicorno', 'boogie', 'boogie-woogie', 'boogie woogie', 'boombox', 'ghetto blaster', 'radioregistratore', 'borbottare', 'brontolare', 'sferragliare', 'bordone', 'bordón', 'brano', 'passaggio', 'passo', 'pezzo', 'brano a più voci', 'brano musicale', 'canzonetta', 'canzone', 'bravura', 'brindisi', 'canto bacchico', 'ditirambo', 'brusio', 'ronzio', "buca d'orchestra", "fossa d'orchestra", "fossa dell'orchestra", 'golfo mistico', 'orchestra', 'cabarettista', 'cabaret', 'cabarè', 'varietà', 'caffè-concerto', 'cadenza', 'cakewalk', 'cake-walk', 'calliope', 'organoavapore', 'calmo', 'quieto', 'silenzioso', 'tranquillo', 'cambiadischi', 'campana a morto', 'knell', 'rintocco', 'campanaro', 'campanelli', 'glockenspiel', 'campanellino', 'canone', "diritti d'autore", 'diritti', 'royalty', 'kanon', 'round', 'cantabile', 'cantante', 'cantantedicantidiNatale', 'cantantedimusicapopolare', 'cantantedimusicasentimentale', 'cantatore', 'musica vocale', 'voce di gola', 'voce di testa', 'voce', 'cantante di lieder', 'cantante melodico', 'cantastorie', 'crooner', 'crooning', 'giullare', 'menestrello', 'cantare', 'cantareappassionatamente', 'cantarecantidiNatale', 'cantare a bocca chiusa', 'cantare a più voci', 'cantare a prima vista', '?lettura a prima vista', 'cantare in discanto', 'cantare inni', 'cantare insieme', 'cantare madrigali', 'cantarellare', 'canterellare', 'canticchiare', 'cantata', 'cantate', 'oratorio', 'canti gregoriani', 'canto gregoriano', 'canto piano', 'cantico', 'canto dei marinai', 'canto marinaresco', 'celeuma', 'shanty', 'cantilenante', 'canto con ritornello', 'canto del lavoro', 'canto di lavoro', 'canto popolare', 'canzone folk', 'canto religioso', 'canto-parlato', 'sprechgesang', 'cantore', 'corista', 'cantore a bocca chiusa', 'cantusfirmus', 'cantofermo', "canzone d'amore", 'canzonettta', 'canzoniere', 'compositore di canzoni', 'paroliere', 'capobanda', 'direttore di banda musicale', 'direttore di banda', 'capriccio', 'carillon', 'carioca', 'casa discografica', 'castagnetta', 'castagnette', 'nacchera', 'nacchere', 'castrati', 'castrato', 'evirato', 'celesta', 'celeste', 'cembalista', 'clavicembalista', 'cembalo', 'tamburello basco', 'tamburello', 'cennamella', 'ceramella', 'ciarameddha', 'ciaramella', 'pipita', 'zufolo', 'pipìta', 'cornamusa', 'piva', 'pive', 'zampogna', 'cetera', 'cetra', 'citola', 'cittern', 'guiterne', 'chanter', 'canna della melodia', 'canna ad cancia doppia', 'chelys-lyra', 'lira', 'chiassoso', 'chiave', 'chiave musicale', 'chiavi musicali', 'sistema tonale', 'tonalità', 'tonalità vicine', 'chiave di basso', 'chiave di fa', 'chiave di contralto', 'chiave di do', 'chiave di sol', 'chiave di violino', 'chiave di soprano', 'chiave di tenore', 'chiave maggiore', 'scala maggiore', 'chitarra', 'chitarra acustica', 'chitarra elettrica', 'chitarrista', 'chitarristi', 'chotis', 'cicaleccio', 'cinguettio', 'pettegolio', 'cigolare', 'gemere', 'scricchiolare', 'stridere', 'cigolio', 'cricchio', 'cric', 'crocchio', 'gemito', 'scricchiolio', 'scricchio', 'cimbalini a dita', 'cimbalista', 'cinguettare', 'gorgheggiare', 'trillare', 'clangore', 'clarinettista', 'clarinista', 'clarinetto basso', 'clarone', 'corno di bassetto', 'clavicordio', 'clavicordo', 'coda musicale', 'coda', 'finale', 'coloratura', 'coloremusicale', 'colorazione', 'commistione di generi', 'complesso musicale', 'ensemble', 'componimento musicale', 'componimento', 'composizione musicale', 'composizioni musicali', 'composizione', 'opera musicale', 'comporre', 'scrivere', 'comporre la colonna sonora', 'concertina', 'concertine', 'fisarmonica', 'piccola fisarmonica', 'concertista', 'concerto', 'esecuzione', 'performance', 'rappresentazione', 'stagione concertistica', 'recital', 'concerto benefico', 'concerto di beneficenza', 'concerto grosso', 'concerto rock', 'rumore', 'conga', 'tumbadora', 'congedo', 'contrabasso', 'contrabbasso', 'contrappuntare', 'contrappuntista', 'contrappunto', 'contrattempo', 'controtempo', 'sincopato', 'sincope', 'controfagotto', 'controtenore', 'controtenore alto', 'cool jazz', 'jazz freddo', 'copione', 'sceneggiatura', 'script', 'trama', 'corale', 'coralmente', 'cornamusista', 'cornettista', 'trombettista', 'tromba', 'cornista', 'corno inglese', 'coro', 'cori', 'coro polifonico', 'gruppo divoci', 'gruppo di strumenti', 'consort di strumenti', 'consort of instruments', 'consort', 'coro greco', 'corona', 'fermata', 'punto coronato', 'corrente', 'courante', 'country & western', 'country music', 'country', 'liscio', 'musica-country', 'musica country', 'nashville sound', 'cover', 'riedizione', 'crepitare', 'scoppiettare', 'crepitio', 'crescendo', 'diminuendo', 'critico musicale', 'cromatico', 'custodia per dischi', 'copertina di disco', 'danza jazz', 'jazz', 'danza macabra', 'decrescendo', 'dee jay', 'deejay', 'deejey', 'disc-jockey', 'disc jockey', 'dj', 'detonazione', 'diapason', 'diapasoninternazionale', 'diatonico', 'scala diatonica', 'dies irae', 'dies iræ', 'diesis', 'diminuzione', 'dipason', 'dipason a fiato', 'accordatore', 'diporto', 'distrazione', 'divertimento', 'intrattenimento', 'sollazzamento', 'spasso', 'svago', 'direttore del coro', 'maestro del coro', 'precentore', 'primo cantore', "direttore d'orchestra", "direttore dell'orchestra", 'direttore di orchestra', "direttori d'orchestra", 'direttore', "direttrice d'orchestra", "direzione d'orchestra", "maestro d'orchestra", 'maestro', 'dirugginio', 'stridio', 'stridore', 'strido', 'urlio', 'urlo', 'discanto', 'dischi in vinile', 'disco a microsolco', 'disco in vinile', 'disco', 'record', 'registrazione', 'registro', 'disco-music', 'disco dance', 'disco music', 'discoteca', 'musica disco', 'disk-jockey', 'DJ', 'distorsionediintermodulazione\xa0', 'diva', 'divo', 'prima donna', 'primadonna', 'serenata', 'do di petto', 'voce di petto', 'musica dodecafonica', 'doo-wop', 'doppia stanghetta', 'dramma musicale', 'dub', 'duetto', 'duo', 'effetti audio', 'effetti sonori', 'effetto audio', 'effetto del suono', 'effetto sonoro', 'eightsome', 'elettrofoni a oscillatori', 'elettrofoni analogici', 'strumenti musicali elettronici', 'strumento elettrico', 'strumento musicale elettronico', 'strumenti musicali elettronici analogici', 'episodio', 'era swing', 'swing era', 'swing', 'esecutore', 'musicisti', 'musico', 'orchestrale', 'sonatore', 'strumentalista', 'strumentista', 'suonatore', 'esecuzione muisicale', 'eseguireconbrio', 'esibizione', 'esplodere', 'esplosione', 'salva', 'scroscio', 'esposizione', 'eterofono', 'teremin', 'theremenista', 'thereminista', 'thereminvox', 'theremin', 'etude', 'studio', 'étude', 'eufonico', 'eufonio', 'euphonium', 'euritmia', 'fado', 'fagottista', 'falsetto', 'fantasia musicale', 'fantasia', 'farefrancasso', 'farerumore', 'fiddle', 'violina', 'violino', 'fiffaro', 'piffero', 'filarmonica', 'orchestra sinfonica', 'fioritura', 'fisarmoniche', 'fisarmonicista', 'fischiata', 'fischio', 'zittio', 'fischietto', 'tin whistle', 'sibilo', 'flautino', 'flauto a becco', 'flauto diritto', 'flauto dolce', 'flauto', 'recorder', 'flauto di pan', 'siringa', "serie di flauti con imboccatura a un'estremità", 'folk', 'musica etnica', 'musica folclorica', 'musica folcloristica', 'musica folklorica', 'musica folk', 'musica popolare', 'musica tradizionale', 'fonografo', 'giradischi', 'fonoriproduttore', 'riproduttore', 'forma-sonata', 'forma sonata', 'forte', 'fortissimo', 'frase musicale', 'fraseggio', 'frase', 'fuga', 'fundimusicaheavymetal', 'funky', 'funk', 'musica funk', 'p-funk', 'gambista', 'gamelan', 'gamma', 'scala musicale', 'scala', 'gavotta', 'gavotte', 'genere musicale', 'generi musicali', 'stili musicali', 'ghironda', 'hurdy gurdy', 'hurdygurdy', 'organetto-di-barberia', 'organetto di barberia', 'organetto', 'organino', 'organo a rulli', 'organo a rullo', 'giazzista', 'jazzista', 'giga', 'giocodellesedie', 'arrangiamentocasuale', 'giullerìa', 'glee club', 'glissando', 'glissato', 'strisciando', 'gorgheggio', 'gospel', 'musica gospel', 'graduale', 'graffio', 'incrinatura', 'raschio', 'scratch', 'sfregamento', 'strappo', 'grammofono', 'grammofono acustico', 'groupie', 'grugnito', 'gruppodimusicapop', 'gruppo rock', 'insieme', 'habanera', 'hare kṛṣṇa', 'heavy-metal', 'heavy metal', 'metal', 'musica metal', 'heckelfono', 'heckelphone', 'heckelphon', 'hi-fi', 'impianto hi-fi', 'highland fling', 'hip-hop', 'hip hop', 'musica hip-hop', 'musica hip hop', 'hornpipe', 'hosanna', 'osanna', 'hotjazz', 'immondo', 'laido', 'lercio', 'lordo', 'lurido', 'sordido', 'sozzo', 'sporco', 'sudicio', 'impiantodiregistrazione', 'impianto stereofonico', 'impianto stereo', 'stereo', 'impromptu', 'improvviso', 'improvvisazione', 'incisione', 'indicazione del tempo', 'inno nazionale', 'inno nazionale francese', 'la marseillaise', 'la marsigliese', 'marsigliese', 'inno religioso', 'innodia', 'inni', 'litania', 'salmodia', 'intavolatura', 'tablatura', 'tablature', 'tabulatura', 'intercalare', 'refrain', 'ripresa', 'riprese', 'ritornelli', 'ritornello', 'intermezzo', 'interpretemusicale', 'cantillare', 'intonazione', 'intro', 'sigla musicale', 'sigla televisiva', 'sigla', 'introduzione', 'ouverture', 'overtura', 'overture', 'preludio', 'introito', 'invertire', 'iPod', 'jam-session', 'jam session', 'jamsession', 'jazzmoderno', 'jazzy', 'jodel', 'jodler', 'yodel', 'jug band', 'juke joint', 'karaoke', 'kazoo', 'koto', 'kwela', 'landler', 'lap slide guitar', 'steel guitar', 'larghetto', 'larghissimo', 'largo', 'legato', 'leggio musicale', 'leggio', 'leit-motiv', 'leitmotiv', 'motivo conduttore', 'tema conduttore', 'lentissimo', 'lento', 'lezione di piano', "libretto d'opera", 'libretti', 'libretto', 'lieder', 'lied', 'lineadibattuta', 'sbarretta', 'stanghetta', 'lionel hampton', 'lirica', 'melodramma', 'musica lirica', 'opera lirica', 'opera', 'lirico', 'liutista', 'macumba', 'madrigale', 'madrigali', 'madrigalista', 'maggiore', 'magnetofono', 'registratore a nastro', 'majorette', 'mambo', 'mandola', 'mandora', 'maracas', 'maraca', 'marching band', 'marcia funebre', 'marcia', 'marcia militare', 'musica militare', 'musica marziale', 'marcia nuziale', 'marcia processionale', 'mariachi', 'marimba', 'marimbe', 'silofono', 'xilofoni', 'xilofono', 'mazurca', 'mazurka', 'mazziere', 'tamburo maggiore', 'medley', 'miscuglio', 'misto', 'pot-pourri', 'canorità', 'melodico', 'melodizzare', 'melodramma buffo', 'opera buffa', 'opera comica', 'opere buffe', 'meno mosso', 'mensurale', 'misurata', 'messa cantata', 'messa', 'metro', 'metronomo', 'metronom', 'plessimetro', 'mezzo soprano', 'mezzosoprano', 'mezzo-soprano', 'minore', 'scala minore', 'minuetto', 'modulazione', 'transizione', 'monkey stick', 'monodia', 'monofonia', 'monodico', 'monofonico', 'mosh', 'motivo', 'soggetto', 'tema musicale', 'tema', 'mottetti', 'mottetto', 'movimento', 'mugolio', 'mugugnare', 'musicapopolare', 'spartito', 'musica a programma', 'musica da scena', 'musica incidentale', 'musiche di scena', 'musica di massa', 'popular music', 'musica per messa da requiem', 'requiem', 'musica per pianoforte', 'musica polifonica', 'polifoniche', 'polifonica', 'polifonico', 'polifonia', 'musica popolare antica', 'old-time music', 'musica rock', 'rock and roll', 'rock', 'musica seriale', 'serialismo', 'serie', 'musica soul', 'soul music', 'soul', 'musica strumentale', 'musica techno', 'techno pop', 'techno trance', 'techno', 'vocale', 'musica-classica', 'musica classica', 'musica colta', 'musica-da-camera', 'musica da camera', 'musiche da camera', 'musicalità', 'armoniosità', 'musicare', 'mettere in musica', 'musica-sacra', 'musica da chiesa', 'musica liturgica', 'musica religiosa', 'musica sacra', 'musica spirituale', 'musicistadijazzsincopato', "musicistarythm'n'blues", 'nasalità', 'nastro magnetico', 'nastro magnetico digitale', 'naturale', 'non accompagnato', 'non risolto;dissonante', 'nota', 'nota di pedale', 'note di pedale', 'pedale invertito', 'pedale ornato', 'pedale', 'nota musicale', 'notazione musicale', 'semiografia musicale', 'notturni', 'notturno', 'obbligato', 'oboe', "oboe d'amore", "oboes d'amore", 'oboista', 'omofonia', 'omofono', 'omofonico', 'opera rock', 'operetta', 'operette', 'orchestra da camera', "orchestra d'archi", 'orchestra filarmonica', 'orchestre', 'orchestrare', 'orchestrazione', 'strumentazione', 'orecchio assoluto', 'organista', 'organoadariaaspirata', 'organo a canne', 'organo', 'organo elettrico', 'organo elettronico', 'organo hammond', 'oscar hammerstein ii', 'oscar hammerstein', 'ostinato', 'ottetto', 'standing ovation', 'overdrive', 'pace', 'quiete', 'silenzio', 'parte', 'parte vocale', 'partita', 'partitura', 'paso-doble', 'paso doble', 'pastorale', 'pausa di minima', 'pausa di semibreve', 'pausa di semiminima', 'pausa musicale', 'pausa', 'pavana', 'payola', 'pentagramma', 'rigo musicale', 'rigo', 'pentatonica', 'scala pentafonica', 'scala pentatonica', 'percezionedelsuono(dapartedelpubblico)', 'percezionemusicale', 'percussionista', 'pianissimo', 'pianista classico', 'pianista', 'pianisti', 'pianistico', 'picchiettio', 'tapping', 'piccolo tamburo', 'rullantino', 'rullante', 'tamburo rullante', 'pifferaio', 'zampognaro', 'pizzicato', 'playlist', 'plettro per chitarra', 'pluf', 'poemasinfonico', 'polca', 'polka', 'politonale', 'postludio', 'preludi', 'preludio corale', 'preparare', 'preparazione', 'presto', 'primacornamusa', 'prima parte', 'primo', 'processionale', 'progressione', 'prove generali', 'prova', 'pubblicazione musicale', 'uscita', 'punk', 'punk rock', 'puntina', 'quadrifonia', 'quadriglia', 'quadriglio', 'quadro', 'scena', 'quartetti per archi', "quartetto d'archi", 'quartetto di violini', 'quartetto per archi', 'quartetto', 'quartettodabarbiere', 'quartettovocalemaschile', 'quartetto strumentale', 'quartetto vocale', 'quickstep', 'quintetto', 'r&b', "r'n'b", 'r & b', "rhythm'n'blues", 'rhythm & blues', "rhythm 'n' blues", 'rhythm and blues', 'rnb', 'rag time', 'ragtime', 'rapper', 'raschiamento', 'rataplan', 'rat-a-tat-tat', 'rat-a-tat', 'rat-tat', 'raucamente', 'con suono rauco', 'realizzato', 'realizzazione', 'recitativo', 'reel', 'reggae', 'registratoreaudio', 'registratore a filo', 'registrazione con nastro magnetico', 'replay', 'riarmonizzare', 'riarmonizzazione', 'ricapitolazione', 'riff', 'tocco', 'riproduttore di cassette', 'riproduzione', 'riproduzione del suono', 'risoluzione', 'risonanza', 'risuonare(consuonometallico)', 'ritorno', 'rivolto', 'rockabilly', 'rockettaro', 'musicista rock', 'rock-star', 'rollio', 'rondello', 'rondò', 'rubato', 'tempo rubato', 'rullio', 'rullo', 'rumba', 'rumore dello schizzo', 'schizzo', 'splash', 'sackbut', "sala d'incisione", 'sala di incisione', 'sala di registrazione', 'studi di registrazione', 'studio di registrazione', 'salmista', 'samba', 'sassofonista', 'saxofonista', 'sassofono tenore', 'sax tenore', 'sbuffo', 'scala con gradi disgiunti', 'scala cromatica', 'scale cromatiche', 'scalpitio', 'scat', 'schioccare', 'schiocco', 'scolio', 'scoppiettio', 'secondo', 'seconda parte', 'segno', 'semiminima', 'sestetto', 'settetto', 'settimino', "sezioned'archi", 'sezionedifiati', 'sezioneditrombe', 'sezione di ottoni', 'ottoni', 'sezione di violini', 'sezione ritmica', 'sforzando', 'sfrigolio', 'sgretolio', 'sguiscio', 'shamisen', 'shuffle notes', 'shuffle', 'swing notes', 'swung note', 'silente', 'silenziare', 'silenziosamente', 'silofonista', 'xilofonista', 'sinfonia', 'sinfonista', 'sinfonizzare', 'sintetizzatore', 'software di sintesi vocale', 'synth', 'skank', 'skiffle', 'solfeggio', 'solfa', 'solista', 'solmisazione', 'solmizzazione', 'solo', 'sonata', 'sonata per pianoforte', 'sonatina', 'soprani', 'soprano', 'soprano di coloratura', 'sopratitolazione', 'sopratitoli', 'sopratitolo', 'soprattitolo', 'sordina', 'sordino', 'sound off', 'spirituals', 'spiritual', 'staccato', 'starnazzo', 'stonato', 'sbagliato', 'stradivario', 'stridemente', 'cacofonia', 'rumore infernale', 'strumentale', 'strumentare', 'strumento a tastiera', 'tastiera', 'suite de danses', 'suite', 'suonare', 'suonareilviolino', 'suonareletromba', 'suonareunflauto', 'suonareunriff', 'suonare del jazz', 'suonare in armonia', 'cantare in armonia', 'suonare legato', 'suonare per strada', 'suonatoredicarillon', 'suonatoredikoto', 'suonatore di flauto dolce', 'suonatore di sitar', 'suonatoridiskiffle', 'suonofelpato', 'suonometallico', 'sviluppo', 'tagli addizionali', 'taglio addizionale', 'tambureggiare', 'tamburellare', 'tango', 'tarantella', 'tastierista', 'tastieristi', "Ta'ziyeh", 'tempo musicale', 'tempo ternario', 'tempra', 'timbro', 'tono', 'qualità', 'tenereiltempo', 'battereiltempo', 'tenore', 'tenori', 'tenor', 'voce di tenore', 'terzetto', 'trio', 'ticchettio', 'timpani', 'timpano', 'timpanista', 'tintinnio', 'toccata', 'tonale', 'tonfo', 'tonica', 'torch song', 'musicasentimentale', 'traccia', 'tracce', 'trad', 'tra-la', 'tra-la-la', 'tramamusicale', 'trascrivere', 'trasporre', 'trasportare', 'tremolo', 'trepitio', 'triangolo', 'trillo', 'trombettiere', 'trombonista', 'trombone', 'twist', 'ukulele', 'ululato', 'usignolo', 'valtzer', 'valzer', 'walzer', 'variazione musicale', 'variazione', 'variazioni', 'vibrafonista', 'vibrato', 'Victrola', 'viola', 'violadagamba', "viola all'inglese", 'viola da gamba', 'viola di gamba', 'viola da braccio', "viola d'amore", 'violinista', 'violinoguarnerio', 'violista', 'violoncellista', 'violoncello', 'virginale', 'virtuosismo', 'virtuoso', 'voce da uomo', 'voce maschile', 'voicings jazzistici', 'voicing', 'voluntary', 'wagneriano', 'walkman', 'zydeco'];
var lexiconDE = ['zwölftonmusik', 'zwölftontechnik', 'dodekaphonie', '12-ton-musik', 'zwölfton-komposition', '12-ton-technik', 'zwölftonkomposition', 'reihentechnik', 'zwölftonsystem', '12-ton-system', 'dodecaphonism', 'acappellagesang', 'acapellagesang', 'absolutesgehör', 'tonhöhengedächtnis', 'relativesgehör', 'absolutetonhöhe', 'versetzungszeichen', 'akzidentalen', 'vierteltonversetzungszeichen', 'warnakzidenzien', 'akzidentien', 'zufällig', 'vorzeichen', 'begleitung', 'begleitinstrument', 'klavierbegleitung', 'akkompagnement', 'accompagnement', 'obligatebegleitung', 'obligatesakkompagnement', 'backup-band', 'musikalischebegleitung', 'begleiter', 'accompanyist', 'akkordeon', 'handharmonika', 'schifferklavier', 'handorgel', 'pianoakkordeon', 'ziehharmonika', 'accordion', 'kwetschn', 'zerrwanst', 'ziehorgel', 'handzuginstrument', 'quetschkommode', 'quetsche', 'akkordeonist', 'piano-akkordeon', 'klavierakkordeon', 'tastenakkordeon', 'chromatischesakkordeon', 'handklavier', 'akkordeonorchester', 'squeeze-box', 'akkordeons', 'akkordeonspieler', 'akkordeonistin', 'akkordeonspielerin', 'acidrock', 'psychedelicrock', 'psychedelischerrock', 'psychedelischemusik', 'psychodelicrock', 'psychedelicpop', 'psychadelicrock', 'grammophon', 'akustischengrammophon', 'akustischegitarre', 'akustikgitarre', 'a-gitarre', 'konzertgitarre', 'flamenco-gitarre', 'klassischegitarre', 'flamencogitarre', 'westerngitarre', 'elektroakustischegitarre', 'electro-acousticguitar', 'folkgitarre', 'adagio', 'arrangeur', 'Entlehnung', 'äolsharfe', 'windharfe', 'äolischeharfe', 'geisterharfe', 'wetterharfe', 'aeolsharfe', 'aeolischeharfe', 'Liebhaber', 'afro-amerikanischemusik', 'blackmusic', 'afroamerikanischemusik', 'racemusic', 'melodie', 'tonfolge', 'melodischephrase', 'melodien', 'melodischenlinie', 'melodischen', 'album', 'musikalbum', 'studioalbum', 'liederalbum', 'debütalbum', 'platte', 'alben', 'schallplatte', 'debüt-album', 'studioalben', 'opener', 'musik-album', 'musik-alben', 'allabreve', 'tactusallabreve', 'alla-breve-takt', 'cutzeit', 'allegretto', 'allegro', 'Alt', 'kontraalt', 'alt', 'countertenor', 'altschlüssel', 'bratschenschlüssel', 'violaclef', 'altsaxophonist', 'altoist', 'altsaxophon', 'altosax', 'melodeon', 'amerikanischeorgelmusik', 'amplitudenverzerrung', 'nichtlineareverzerrung', 'unterhaltung', 'zerstreuung', 'unterhalter', 'volksbelustigung', 'entertainer', 'unterhalten', 'andante', 'anthem', 'hymne', 'hymnen', 'hymnus', 'kirchenlied', 'loblied', 'christlichehymne', 'hymnodist', 'hymnwriter', 'hymnographer', 'hymnist', 'antiphon', 'wechselgesang', 'antiphonie', 'antiphona', 'antifon', 'antiphonal', 'antiphonen', 'mehrchörigkeit', 'Antiphon', 'Antifon', 'Antiphone', 'Antifone', 'klatschen', 'applaus', 'beifall', 'händeklatschen', 'standingovations', 'geklatsche', 'stehendeovation', 'stehendeovationen', 'alppaudieren', 'akklamieren', 'handclaps', 'arie', 'bravour-arie', 'ariette', 'da-capo-arie', 'bravourarie', 'arien', 'kurzenarie', 'arietta', 'arioso', 'arpeggio', 'arpeggiando', 'harpeggio', 'brechungszeichen', 'akkordbrechung', 'gebrochenenakkord', 'arpeggien', 'arrangement', 'arrangeure', 'anordnung', 'arrangieren', 'musikalischegestaltung', 'angeordnet', 'transkription', 'vermittlung', 'progressiverock', 'prog-rock', 'prog', 'art-rock', 'artrock', 'artpop', 'progrock', 'longtrack', 'progressive-rock', 'symphonicrock', 'progrock-gruppe', 'kunstpop', 'atonalität', 'atonal', 'atonalemusik', 'atonalenmusik', 'Audio', 'audio-aufnahme', 'tonaufnahmen', 'tonaufzeichnungundtonwiedergabe', 'audio-speicherung', 'sound-system', 'soundsystem', 'audiosystem', 'Tonband', 'vorsingen', 'probespiel', 'probesingen', 'casting', 'vorspielen', 'probevorführung', 'auditions', 'vorsprechen', 'cattlecall', 'psychoakustik', 'auditivenwahrnehmung', 'psychoakustischenmodell', 'klangwahrnehmung', 'psychoakustischen', 'auditivewahrnehmung', 'klang', 'laut', 'schall', 'hörempfinden', 'plattenwechsler', 'cd-wechsler', 'avantgarde', 'avantgardismus', 'avantgardist', 'avantgardistisch', 'avant-garde', 'avantgardistischen', 'avantgarde-musik', 'avantgardetheater', 'avantgarde-kunst', 'newwave', 'backbeat', 'bagatelle', 'dudelsack', 'sackpfeife', 'borderpipe', 'bockpfeife', 'bagpipe', 'dudelsackpfeifer', 'dudelsackspielerin', 'dudelsackpfeiferin', 'dudelsackspieler', 'balalaika', 'balalajka', 'balaleika', 'balladen', 'rock-ballade', 'power-ballade', 'ballade', 'pop-ballade', 'power-balladen', 'songwriter', 'songster', 'liedermacher', 'songwriting', 'songschreiber', 'songwriterin', 'liedermacherin', 'songschreiberin', 'texterundkomponist', 'ballademaker', 'crooner', 'crooning', 'schlagersänger', 'schnulzensänger', 'balladeer', 'croon', 'sänger', 'Ballett', 'tanzmusik', 'danceroommusik', 'knall', 'schlag', 'hieb', 'band', 'gruppe', 'musikgruppe', 'kapelle', 'combo', 'musikkapelle', 'solo-projekt', 'barband', 'solo-künstler', 'musikalischesensemble', 'pop-rock-band', 'pop-band', 'tanzband', 'tanzorchester', 'bandleader', 'blasmusikleiter', 'blasorchesterdirigent', 'bandleaderin', 'kapellmeister', 'bandoneon', 'bandonion', 'bandoneonist', 'musiker', 'skolion', 'scolion', 'bankett-song', 'taktart', 'taktangabe', 'musikalischetaktart', 'taktstrich', 'barbershop-quartett', 'barbershop-musik', 'barkarole', 'barcarole', 'gondellied', 'bariton', 'tenorbariton', 'lyrischerbariton', 'baritone', 'barytone', 'baritonstimme', 'baritonhorn', 'bellfront', 'drehleier', 'drehorgel', 'leierkasten', 'leierkastenmann', 'drehorgelspieler', 'radleier', 'werkelmann', 'viellearoue', 'bauernleier', 'savoyardenorgel', 'tekerö', 'harmonipan', 'zanfona', 'straßenorgel', 'organistrum', 'schleifenorgel', 'werkel', 'bass', 'tiefton', 'baß', 'Bass', 'oktavist', 'bassoprofondo', 'schwarzerbass', 'basso', 'bass-stimme', 'baßbuffo', 'bass-sänger', 'bassklarinette', 'bassschlüssel', 'F-Schlüssel', 'großetrommel', 'bassdrum', 'kickdrum', 'bassdrumrosette', 'basstrommel', 'grossetrommel', 'bass-drum-rosette', 'grancassa', 'odaiko', 'bass-drum', 'fußmaschine', 'grancasa', 'bassdrums', 'kontrabass', 'bassgeige', 'bullfiddle', 'contrabass', 'kontrabaß', 'stehbass', 'baßgeige', 'bull-fiddle', 'kontrabassist', 'kontrabässe', 'stand-up-bass', 'stringbass', 'e-bass', 'bassgitarre', 'bass-gitarre', 'violabaixo', 'baßgitarre', 'elektrischerbass', 'elektrobass', 'elektrischebassgitarre', 'e-bassgitarre', 'fretlessbass', 'bässe', 'violadagamba', 'gamba', 'bassetthorn', 'cornodibassetto', 'heckelphon', 'bassetoboe', 'bassist', 'bassistin', 'bassisten', 'bezifferung', 'bassocontinuo', 'generalbass', 'bezifferterbass', 'continuo', 'beziffertenbass', 'fagottist', 'fagottspieler', 'fagottspielerin', 'fagottistin', 'taktstock', 'dirigentenstab', 'dirigierstab', 'rhythmus', 'beat', 'polyrhythmus', 'grundschlag', 'off-beat', 'rhythmen', 'rhythmischeeinheit', 'musikalischenrhythmus', 'bebop', 'be-bop', 'Beguine', 'belcanto', 'belkanto', 'Glöckner', 'tribute-album', 'tributealbum', 'tribut-album', 'tributalbum', 'profitierenalbum', 'tribute-alben', 'benefizkonzert', 'wiegenlied', 'schlaflied', 'gutenachtlied', 'gute-nacht-lied', 'bercöse', 'schlaf-', 'berceuse', 'bigband', 'big-band', 'mambobigband', 'jazz-orchestra', 'jazzorchestra', 'bigbands', 'jazz-orchester', 'big-band-musik', 'krach', 'lärm', 'lärmkulisse', 'schmetternden', 'schmettern', 'bluenote', 'bluenotes', 'blue-notes', 'blue-note', 'bluegrass', 'bluegrass-band', 'blues', 'bluesmusiker', 'blues-musik', 'blues-schema', 'bluesschema', 'bluesman', 'bluesigen', 'bolero', 'boleros', 'bombarde', 'bombardieren', 'kastagnetten', 'castagnette', 'castagnetten', 'kastagnette', 'palillos', 'castanuelas', 'gebeine', 'fingerzimbeln', 'klöppel', 'fingercymbals', 'boogie-woogie', 'boogie', 'boogiewoogie', 'countryboogie', 'country-boogie', 'hillbillyboogie', 'hillbilly-boogie', 'landboogie', 'musical', 'skript', 'drehbuch', 'musikalischenkomödien', 'playscript', 'musiktheater', 'musicaltheater', 'musicals', 'ghettoblaster', 'gettoblaster', 'radiorekorder', 'radiorecorder', 'boombox', 'ghetto-blaster', 'getto-blaster', 'operabuffa', 'opérabouffon', 'opérettebouffe', 'operabouffon', 'operabouffe', 'operettebouffe', 'komischeoper', 'opérabouffe', 'operbouffe', 'buffo', 'komischeopern', 'bouffe', 'operacomique', 'bordunpfeife', 'bordun', 'bordunsaite', 'bordunpfeifen', 'borduninstrument', 'drohne', 'bourdon', 'bläser', 'bläsersatz', 'brassband', 'blaskapelle', 'brass-band', 'brass-musik', 'blaskapellen', 'bravour', 'tumult', 'liebhaber', 'fan', 'anhänger', 'kenner', 'anhängerschaft', '-freund', '-freundin', 'kennerin', 'enthusiast', 'verehrer', '-liebhaber', 'bewunderer', 'entourage', '-liebhaberin', 'hornist', 'country-musik', 'countryundwestern', 'country', 'countrymusik', 'countrymusic', 'country&western', 'c&w', 'country-gospel', 'countrygospel', 'country-pop', 'amerikanischencountry-musik', 'countryundwesternmusik', 'country-sänger', 'cundw', 'neuecountry-musik-format', 'country-musiker', 'klassischencountry-musik-format', 'countrywestern', 'C-Schlüssel', 'kabarett', 'cabaret', 'kabaret', 'kleinkunstbühne', 'künstlerkabarett', 'kabarettbühne', 'kabaretts', 'floorshow', 'kadenz', 'perfektekadenz', 'trugschluss', 'solokadenz', 'kadenzen', 'cakewalk', 'cake-walk', 'chalklinewalk', 'dampforgel', 'dampforgan', 'calliope', 'kanon', 'rätselkanon', 'caccia', 'kantate', 'oratorium', 'choralkantate', 'oratorien', 'kammerkantate', 'oratoriensänger', 'kirchenkantate', 'solokantate', 'kantaten', 'canticum', 'cantica', 'lobgesang', 'kantor', 'vorsänger', 'kantorin', 'chorleiter', 'vikariatskantor', 'domkantor', 'chormeister', 'präzentor', 'chordirektor', 'vorsängerin', 'vorbeter', 'cantusfirmus', 'cantusfirmi', 'cantuspriusfactus', 'cantus-firmus-technik', 'capriccio', 'carillonneur', 'carioca', 'Carioca', 'caroller', 'caroler', 'caroling', 'glockenstab', 'schlittengeläut', 'schlittenglocke', 'glöckchen', 'cascabel', 'kassettendeck', 'kassettenrekorder', 'tape-deck', 'kassettenrecorder', 'kassettentonbandgerät', 'cassettenrekorder', 'cassettenrecorder', 'tapedeck', 'kastrat', 'kastraten', 'kastratenstimme', 'celesta', 'cellist', 'cellistin', 'violoncellist', 'violoncello', 'cello', 'violoncelli', 'celli', 'violoncellistin', 'stehgeige', 'violoncellopiccolo', 'kammermusik', 'kammerkonzert', 'kammermusikensemble', 'kammerensemble', 'kammerorchester', 'chanting', 'chant', 'gesang', 'gesänge', 'chanter', 'melodiepfeife', 'melodierohr', 'shanty', 'seemannslied', 'shanty-chor', 'shantychor', 'shanties', 'matrosenlied', 'shantys', 'meerchantey', 'seemannslieder', 'singen', 'Geschwätz', 'bruststimme', 'modalstimme', 'modallage', 'brustton', 'brustregister', 'chor', 'chorgesang', 'chorsänger', 'volkschor', 'chorist', 'ttbb', 'gesangschor', 'gleichstimmigerchor', 'gemischtenchor', 'gemischterchor', 'chorkonzert', 'sctb', 'sprechchor', 'chormusik', 'chöre', 'kirchenchor', 'kinderchor', 'konzertchor', 'vokalensemble', 'consort', 'consort-musik', 'sängerknabe', 'choralvorspiel', 'chorknabe', 'chorsängerin', 'refrain', 'kehrreim', 'kehrvers', 'gegenrefrain', 'anfangskehrreim', 'binnenkehrreim', 'festerkehrreim', 'kettenkehrreim', 'periodischerkehrreim', 'tonrefrain', 'rahmenreim', 'wortrefrain', 'alternierenderkehrreim', 'endkehrreim', 'flüssigerkehrreim', 'schlussrefrain', 'verzichten', 'choros', 'theaterchor', 'griechischerchor', 'chromatischetonleiter', 'chromatik', 'halbtonleiter', 'chromatischestimmung', 'chromatischentonleiter', 'kirchenmusik', 'religiösemusik', 'geistlichemusik', 'sakralmusik', 'kirchenmusikgeschichte', 'geschichtederkirchenmusik', 'sakralemusik', 'citole', 'cister', 'englishguitar', 'zither', 'lutherzither', 'zister', 'zitter', 'englischegitarre', 'gittern', 'zitterpartie', 'citrinchen', 'halszither', 'cithrinchen', 'Klatsch', 'krachen', 'getöse', 'clangour', 'klappern', 'clangoring', 'clangor', 'rasseln', 'klarinettist', 'klarinettistin', 'klarinettenspieler', 'klassischemusik', 'kunstmusik', 'klassik', 'klassischemusiker', 'westlicheklassischemusik', 'westlichenkunstmusik', 'westlichenklassischenmusik', 'klassisch', 'ernstemusik', 'europäischenklassischenmusik', 'klackern', 'rappeln', 'gerappel', 'geklacker', 'geklapper', 'gepolter', 'clavichord', 'klavichord', 'klavier', 'notenschlüssel', 'schlüssel', 'schließenvorhang', 'coda', 'koda', 'finale', 'codazeichen', 'ausklang', '𝄌', 'codetta', 'Klangfarbe', 'koloratursopran', 'koloratursoubrette', 'lyrischerkoloratursopran', 'Koloratur', 'jazzband', 'jazz-gruppe', 'jazz-band', 'comeback', 'wirbel', 'kerfuffle', 'theater', 'aufregung', 'aufruhr', 'durcheinander', 'to-do-', 'hoo-ha', 'balgerei', 'trubel', 'hoo-hah', 'komponist', 'komponistin', 'tonsetzer', 'autor', 'musikkomponist', 'kompositeur', 'compositeur', 'tonsetzerin', 'Komposition', 'komposition', 'musikkomposition', 'komponieren', 'stück', 'kompositionen', 'musikalischekompositionen', 'kompositionsrichtung', 'musikalischekomposition', 'musikkompositionen', 'musikalischesstück', 'musikstück', 'opus', 'konzeptalbum', 'konzept-album', 'konzeptalben', 'konzert', 'rockkonzert', 'popkonzert', 'performance', 'auftritt', 'aufführung', 'musikveranstaltung', 'live-musik', 'konzerte', 'konzertreise', 'tour', 'live-konzert', 'blasorchester', 'blasmusik', 'militärmusik', 'militärorchester', 'harmonieorchester', 'sinfonischeblasmusik', 'bläsermusik', 'schlachtengesang', 'harmonie', 'sinfonischesblasorchester', 'militärkapelle', 'militärkapellen', 'kammerton', 'a440', 'a-', 'standardkammerton', 'normalstimmton', 'philharmonischenpitch', 'internationalenpitch', 'polyphonie', 'polyfonie', 'mehrstimmigkeit', 'polyphonemusik', 'konzertiertemusik', 'polyphonermusik', 'polyphone', 'konzertina', 'concertina', 'instrumentalkonzert', 'quadrupelkonzert', 'solokonzert', 'concerto', 'concertogrosso', 'concertigrossi', 'concertino', 'dirigieren', 'musikalischeleitung', 'dirigat', 'dirigent', 'durchgeführt', 'orchesterleiter', 'dirigentin', 'musikalischerleiter', 'gastdirigent', 'musikdirektor', 'conga', 'congas', 'tumbadora', 'conguero', 'polonaise', 'kontrafagott', 'contrafagotto', 'altistin', 'kontrapunktiker', 'cooljazz', 'englischhorn', 'englisch-horn', 'cornoinglese', 'altoboe', 'cornetist', 'trompeter', 'kontrapunkt', 'contrapunctus', 'kontrapunktisch', 'contrapunkt', 'stimmführung', 'kontrapunktik', 'punctuscontrapunctum', 'stimmführungsregeln', 'kontrasubjekt', 'contrapunct', 'artenkontrapunkt', 'kontrapunktischen', 'countertenöre', 'kontratenor', 'courante', 'corrente', 'corranto', 'correnta', 'coranto', 'curanta', 'coverversion', 'cover-version', 'cover-song', 'cover', 'coversong', 'covern', 'neueinspielung', 'cover-versionen', 'abdeckung', 'cover-album', 'knarren', 'quietschen', 'crescendo', 'dynamik', 'summend', 'crossover', 'crossover-musik', 'viertelnote', 'viertel', 'viertel-note', 'Track', 'zimbalist', 'totentanz', 'dansemacabre', 'danceofdeath', 'thedanceofdeath', 'tanzdestodes', 'dat', 'digitaletonband', 'trauermarsch', 'totenmarschieren', 'diminuendo', 'decrescendo', 'discantus', 'sopran', 'diskant', 'durchführung', 'musikalischeentwicklung', 'entwicklung', 'diatonik', 'diatonisch', 'diatonischentonleiter', 'diatonischesintervall', 'diesirae', 'tubamirum', 'totensequenz', 'diesire', 'diesiræ', 'diminution', 'ding-dong', 'schallplatten', 'vinyl', 'langspielplatte', 'akustischenaufnahme', 'vinyl-single', '78rpmrecord', 'vinyl-album', '7vinyl', '78rpm', '7-zoll-single', 'vinyl-schallplatte', '78s', '45rpm', '7single', 'scheibe', '45datensatz', 'phonographen-aufnahme', 'dj', 'discjockey', 'diskjockey', 'disc-jockey', 'djane', 'plattenaufleger', 'she-dj', 'djing', 'schallplattenalleinunterhalter', 'residentdj', 'deejay', 'schallplattenunterhalter', 'resident-dj', 'disc-jockeys', 'radiodj', 'djs', 'wähler', 'deejaying', 'disco', 'disco-musik', 'disco-music', 'diskothek', 'discomusik', 'disco-ära', 'dissonanz', 'verzerrer', 'gitarrenverzerrer', 'fuzz-gitarre', 'overdrive', 'distortion-pedal', 'fuzzbox', 'übersteuerten', 'liedchen', 'primadonna', 'diva', 'primadonnaassoluta', 'diven', 'primouomo', 'divas', 'divertimento', 'serenade', 'divertimenti', 'divermento', 'serenata', 'doowop', 'doo-wop', 'doowoop', 'doo-woop', 'doppel-bar', 'downbeat', 'trinklied', 'trinklieder', 'tambourmajor', 'drummajor', 'majoretten', 'trommelwirbel', 'paradiddle', 'rudimente', 'rudiment', 'drum-pattern', 'rataplan', 'trommelschlag', 'rub-a-dub', 'schlagzeuger', 'schlagzeugerin', 'trommler', 'drummerin', 'trommlerin', 'drummer', 'probe', 'rehearsal', 'probelauf', 'dryrun', 'dub', 'synchronisieren', 'dubreggae', 'Duett', 'duett', 'duo', 'e-gitarre', 'elektrogitarre', 'elektrischegitarre', 'stromgitarre', 'elektro-gitarre', 'e-gitarren', 'egitarre', 'elektronischeorgel', 'hammond-orgel', 'heimorgel', 'hammondorgel', 'digitalorgel', 'sakralorgel', 'e-orgel', 'elektrium', 'harmonicfoldback', 'hammondinternationalcompany', 'orgel', 'tonewheel', 'konzertorgel', 'elektronenorgel', 'hammond', 'b3orgel', 'hammondb3orgel', 'hammondb-3orgel', 'elektrischeorgel', 'elektronischesmusikinstrument', 'elektronischesinstrument', 'elektronischemusikinstrumente', 'elektronischenmusikinstrumenten', 'elektronischeinstrumente', 'zugabe', 'rätselhaftencanon', 'enigmaticalcanon', 'enigmacanon', 'rätselcanon', 'Ensemble', 'Episode', 'volksmusik', 'tune', 'traditionellemusik', 'weltmusik', 'volksmusiksänger', 'folk-musiker', 'volkslieder', 'ethnischemusik', 'folk-gruppe', 'akustischefolk', 'volkslied', 'folk-band', 'etüde', 'etude', 'etüden', 'étude', 'euphonium', 'euphonien', 'musik', 'wohlklang', 'eurythmie', 'heileurythmie', 'eurythmietherapie', 'eurhythmie', 'eurythmics', 'Explosion', 'exposition', 'ausstellung', 'improvisator', 'improvisieren', 'improvisation', 'unvorbereitete', 'improvisationen', 'extemporisation', 'fado', 'fadista', 'falsett', 'falsettist', 'falsettstimme', 'falsetto', 'falsett-register', 'fanfare', 'trompetenstoß', 'tusch', 'rüschenundgedeiht', 'rüschenundschnörkel', 'tucket', 'fantasie', 'phantasie', 'fantasia', 'fermate', '𝄑', '𝄐', 'geige', 'violine', 'fiddle', 'irishfiddle', 'fiedel', 'fidel', 'viertelgeige', 'hantieren', 'geigen', 'geiger', 'violinist', 'violinistin', 'schwegel', 'pfeife', 'schwegelpfeife', 'blockflöte', 'holzblockflöte', 'flautodolce', 'sopraninoblockflöte', 'fippleflöte', 'sopraninoflöte', 'deutschegriffweise', 'kontrabassblockflöte', 'blockflötist', 'griffweise', 'baßflöte', 'barockgriffweise', 'subkontrabassflöte', 'subkontrabassblockflöte', 'baßblockflöte', 'altblockflöte', 'bassblockflöte', 'barockegriffweise', 'vertikaleflöte', 'fipplerohr', 'gezisch', 'totschweigen', 'flamenco', 'flamenco-musik', 'b', 'be', '♭', 'flötist', 'flötistin', 'flötenspieler', 'flötenspielerin', 'listevonflötisten', 'flügelhorn', 'flugelhorn', 'fluegelhorn', 'flügelhornist', 'fluglehorn', 'folk-ballade', 'volksballade', 'fortissimo', 'forte', 'pianoforte', 'piano', 'klavierflügel', 'hammer', 'saitenklavier', 'oberdämpfer', 'klavierpedal', 'tonhaltepedal', 'forte-piano', 'stutzflügel', 'hammerflügel', 'hammerklavier', 'grandpiano', 'fuge', 'fughetta', 'doppelfuge', 'permutationsfuge', 'fugato', 'quadrupelfuge', 'fuga', 'spiegelfuge', 'fugette', 'tripelfuge', 'fugen', 'fugierten', 'funk', 'funky', 'funk-musik', 'violinschlüssel', 'G-Schlüssel', 'gambisten', 'gamelan', 'karawitan', 'tonumfang', 'chromatische', 'diatonischen', 'gappedskala', 'garboil', 'tumultuousness', 'gavotte', 'musikgenre', 'musik-genre', 'genre', 'musikalischesgenre', 'gattung', 'musikart', 'musikgattung', 'musikgattungen', 'musikrichtung', 'fusiongenre', 'musik-stil', 'musikstil', 'musikalischenstil', 'musikrichtungen', 'gestalt', 'mugge', 'gig', 'gigue', 'irishjig', 'jig', 'jigs', 'männergesangverein', 'gleeclubs', 'gleeclub', 'glissando', 'glissicando', 'glissato', 'glisscato', 'glissandi', 'glockenspiel', 'orchesterglocken', 'elektronischeglockenspiel', 'oldie', 'gospel', 'gospelmusik', 'gospelaward', 'gospel-award', 'gospelgesang', 'gospelchor', 'gospelsängerin', 'graduale', 'responsoriumgraduale', 'allmählich', 'schrittweise', 'großeoper', 'gregorianik', 'gregorianischerchoral', 'gregorianischegesänge', 'gregorianischergesang', 'choral', 'cantusplanus', 'cantusromanus', 'gregorianisch', 'plainsong', 'plainchant', 'Knirschen', 'grundbass', 'groupie', 'rumpeln', 'grollen', 'poltern', 'grunz', 'gitarre', 'gitarren', 'doppelhalsgitarre', 'guitarre', 'guitarra', 'zwölfsaitigegitarre', 'ketarre', 'renaissancegitarre', 'violão', '12-string', 'rock-gitarre', 'plektrum', 'gitarrist', 'gitarristin', 'gitarrenspieler', 'gitarrenspielerin', 'gitarrenheld', 'gitarristen', 'rock-gitarrist', 'habanera', 'einhalbrest', 'halleluja', 'hallelujah', 'alleluja', 'alleluia', 'schlägel', 'schlegel', 'percussionmallet', 'oscarhammersteinii', 'oscarhammerstein', 'oscargreeleyclendenninghammersteinii', 'hammerstein', 'lionelhampton', 'hampton', 'Applaus', 'handclap', 'hare-krishna-mantra', 'mahamantra', 'harekrishna-mantra', 'oberton', 'harmonisierung', '', 'harmonium', 'druckwindharmonium', 'harmonik', 'harmonielehre', 'harmonikundharmonielehre', 'harmonisch', 'harmonien', 'musikalischeharmonie', 'harfe', 'doppelpedalharfe', 'harfenist', 'chromatischeharfen', 'paraguay-harfe', 'konzertharfe', 'tirolervolksharfe', 'harfenistin', 'einfachpedalharfe', 'hakenharfe', 'lateinamerikanischeharfen', 'südamerikanischeharfe', 'südamerikanischeharfen', 'pedalharfe', 'paraguayischeharfe', 'lateinamerikanischeharfe', 'harfen', 'harfenspieler', 'harfner', 'harfenspielerin', 'harper', 'cembalist', 'cembalistin', 'listevoncembalisten', 'cembalospielerin', 'cembalospieler', 'oboe', 'hautbois', 'hoboe', 'oboist', 'wieneroboe', 'standardoboe', 'barockenoboe', 'oboen', 'steel-gitarre', 'hawaii-gitarre', 'lapslide-gitarre', 'kopfstimme', 'männerstimme', 'menschlichenstimme', 'kopfregister', 'kopfton', 'metal', 'metalhead', 'heavymetal', 'metalmusik', 'metal-band', 'metalstile', 'heavymetalband', 'heavymetalmusik', 'high-fidelity-sound-system', 'highlandfling', 'old-timemusic', 'hillbillymusik', 'old-time', 'hillbilly-musik', 'hip-hop', 'hiphop', 'hip-hop-musik', 'rap', 'hiphopper', 'latinhip-hop', 'hip-hopper', 'rap-musik', 'latinhiphop', 'hip-hopmusik', 'hip-hop-künstler', 'rap-gruppe', 'hip-hop-gruppe', 'homophonie', 'melodiesatz', 'homofonie', 'akkordsatz', 'homophonen', 'hornpipe', 'hosanna', 'hosianna', 'osianna', 'hotjazz', 'Heulerei', 'summton', 'brummen', 'summen', 'Summen', 'stille', 'hymnody', 'psalmodie', 'psalmody', 'thema', 'melodischesthema', 'musikalischesthema', 'pastorale', 'impromptu', 'bühnenmusik', 'schauspielmusik', 'lückenbüßer', 'Instrumentalmusik', 'instrumentalmusik', 'instrumentalmusic', 'instrumentals', 'musikerin', 'instrumentalist', 'musikant', 'musikantin', 'berufsmusiker', 'spieler', 'spielmann', 'tonkünstler', 'musikus', 'hobbymusikerin', 'hobbymusiker', 'berufsmusikerin', 'freizeitmusiker', 'freizeitmusikerin', 'musikkünstler', 'hausmusiker', 'instrumentalisten', 'musikern', 'musikalischenkünstler', 'musik-künstler', 'Instrumentierung', 'instrumentierung', 'instrumentation', 'instrumentationskunde', 'orchestrator', 'orchestrieren', 'instrumentationslehre', 'orchestrierungen', 'orchestrierung', 'orchestriert', 'Intermezzo', 'intonation', 'vorsingenderanfangsworte', 'intro', 'einleitung', 'introitus', 'eröffnungsvers', 'umkehrung', 'inversion', 'ipod', 'jam-session', 'jamsession', 'musiksession', 'jam-sessions', 'klirren', 'janglepop', 'jazz', 'blackamericanmusic', 'jazzmusik', 'jazzmusiker', 'jazz-musiker', 'jazzkomponist', 'jazzy', 'modernjazz', 'jazzdance', 'jazztanz', 'jazz-dance', 'jazzman', 'maultrommel', 'brummeisen', 'wasser-maultrommel', 'judenharfe', 'mundtrommel', 'maulgeige', 'maultrommelspiel', 'danmoi', 'mundbogen', 'swing', 'swing-musik', 'swing-band', 'swingjazz', 'jukejoint', 'ghettohaus', 'jookgemeinsame', 'jukehouse', 'jookhaus', 'jug-band', 'jugband', 'krug-band', 'jugbands', 'karaoke', 'norebang', 'noraebang', 'rudelsingen', 'karaoke-maschine', 'karaoke-box', 'kazoo', 'kazzoo', 'kazoos', 'pauke', 'kesselpauke', 'pauken', 'timpani', 'paukist', 'timpano', 'tympani', 'kesselpauken', 'maschinenpauke', 'pedalpauke', 'tonart', 'tonalität', 'tonalemusik', 'tonarten', 'his-dur', 'eis-dur', 'tonalenmusik', 'tasteninstrument', 'klaviatur', 'manual', 'tastatur', 'keyboards', 'keyboarder', 'keyboarderin', 'letztesgeläut', 'geläut', 'knell', 'abschiedsgeläut', 'totenglocke', 'koto', 'koto-spieler', 'kwela', 'lp', 'longplay', 'langespieldauer', 'lpalbum', 'l-p', 'lagerphone', 'Ländler', 'larghetto', 'largo', 'leadsheet', 'fake-musik', 'fakemusic', 'lead-sheet', 'fake-music', 'fakemusik', 'walzblei', 'hilfslinie', 'hilfslinien', 'leitmotiv', 'ideefixe', 'kennmotiv', 'leitthema', 'idéefixe', 'leitmotive', 'libretto', 'libretti', 'opernlibretto', 'librettist', 'kunstlied', 'liedsänger', 'lied', 'orchesterlied', 'lieder', 'operette', 'operettensänger', 'opéra-bouffe', 'operettensängerin', 'operetten', 'shuffle', 'shuffle-groove', 'ternärerhythmik', 'shuffle-rhythmus', 'trällern', 'Litanei', 'liebeslied', 'liebeslieder', 'lautenist', 'lautenisten', 'lautenspieler', 'leier', 'lyra', 'antikelyra', 'chelys', 'Liră', 'leiern', 'lyricality', 'gesanglichkeit', 'Macumba', 'madrigal', 'madrigalist', 'dur-tonleiter', 'dur', 'durterz', 'durtonleiter', 'großendiatonischentonleiter', 'mambo', 'mandola', 'maracas', 'maraca', 'rumbakugeln', 'rumba-rassel', 'maracás', 'rumba-rasseln', 'rumba-kugeln', 'rumbakugel', 'rumbarasseln', 'rumba-kugel', 'rumbarassel', 'rassel', 'marsch', 'marschmusik', 'militärmarsch', 'marschlied', 'marchingband', 'show-marchingband', 'marschkapelle', 'marchingbands', 'mariachi', 'mariachi-band', 'xylophon', 'marimba', 'marimbaphon', 'xylofon', 'marimbafon', 'hulzeglechter', 'marimbamallet', 'hölzernesgelächter', 'xylophone', 'gyil', 'marimbas', 'marseillaise', 'französischenationalhymne', 'nationalhymnevonfrankreich', 'lamarseillaise', 'nationalhymnefrankreichs', 'militärischenmarsch', 'messe', 'mazurka', 'playerpiano', 'pianola', 'organola', 'selbstspielklavier', 'vorsetzer', 'phonola', 'mechanischesklavier', 'potpourri', 'schmelz', 'melodik', 'tonmuster', 'menomosso', 'metrum', 'meter', 'duple', 'verbindungzeit', 'einfachenzeit', 'verbindungmeter', 'polymetren', 'metronom', 'mezzosopran', 'mezzosopranist', 'mezzosopranistin', 'mezzo-sopran', 'mezzosopranistinnen', 'Mezzosopran', 'moll', 'moll-tonleiter', 'mollterz', 'melodischesmoll', 'molltonleiter', 'harmonischesmoll', 'harmonischemoll', 'melodischenmolltonleiter', 'natürlichemoll', 'natürlichenmoll-tonleiter', 'harmonischenmoll-tonleiter', 'kleinerediatonischentonleiter', 'Minnelieder', 'menuett', 'minuetto', 'menuetto', 'menuet', 'menuette', 'neuenjazz', 'neojazz', 'nu-jazz', 'modernenjazz', 'nujazz', 'überleitung', 'monodie', 'monophonie', 'monofonie', 'monofon', 'monophon', 'monodischesprinzip', 'monophony', 'monodischen', 'monophonemusik', 'moonwalk', 'morceau', 'motette', 'motetten', 'motiv', 'musikalischesmotiv', 'musikalischeidee', 'satz', 'satzbezeichnung', 'satzfolge', 'bewegung', 'musetterohr', 'Musik', 'spieluhr', 'spieldose', 'musikdose', 'walzenspieldose', 'lochplatte', 'plattenspieldose', 'musikkritiker', 'musikkritik', 'notenständer', 'notenpult', 'ReisenachJerusalem', 'musikdrama', 'ensemble', 'musikalischeorganisation', 'musikalischegruppe', 'notenschrift', 'notation', 'notentext', 'notenbild', 'musiknotation', 'musikalischenotation', 'notenzeichen', 'tonname', 'notennamen', 'notenname', 'rhythmusnotation', 'note', 'musiknote', 'ton', 'notenkopf', 'notenhals', '♩', '♪', '♫', '♬', 'noten', 'musikpassage', 'musikkognition', 'musikalischewahrnehmung', 'musikpsychologie', 'musikalischedarbietung', 'phrase', 'musikalischephrase', 'musikalischephrasierung', 'tonleiter', 'tonleitern', 'skala', 'tonscala', 'tonskala', 'ais', 'cis', 'dis', 'ces', 'gis', 'fis', 'des', 'his', 'ges', 'fes', 'a', 'c', 'd', 'e', 'f', 'g', 'h', 'es', 'as', 'partitur', 'musikalität', 'musicalität', 'Musiker', 'dämpfer', 'hoteldämpfer', 'holzbläsertrompete', 'gedämpftetrompete', 'harmonmute', 'nasalitätsstörung', 'rhinophonie', 'rhinolalia', 'rhinolalie', 'näseln', 'nasalität', 'nationalhymne', 'nationalhymnen', 'negrospiritual', 'spiritual', 'african-americanspiritual', 'geistig', 'spirituals', 'negro-spirituals', 'negrospirituals', 'nocturne', 'nokturne', 'notturno', 'nachtstück', 'nocturnes', 'geräusch', 'geräuschemission', 'obligat', 'oboed-amore', 'oboed’amore', 'liebesoboe', 'oboedacaccia', 'oboistin', 'Oktett', 'auftakt', 'oper', 'barockoper', 'opernsängerin', 'opern', 'Operă', 'geschichtederoper', 'romantischeoper', 'opernsänger', 'opernmusik', 'venezianischeoper', 'opernstar', 'opernsterne', 'orchester', 'orchestermusik', 'symphonieorchester', 'orchestermusiker', 'sinfonieorchester', 'orchestern', 'orchesterwerk', 'symphonyorchestra', 'chamberorchestra', 'orchestergraben', 'Orchestrierung', 'kirchenorgel', 'pfeifenorgel', 'pfeifenklavier', 'langhausorgel', 'kombinationsorgel', 'kirchorgel', 'orgeln', 'organist', 'organistin', 'orgelspieler', 'orgelspielerin', 'domorganist', 'konzertorganist', 'ostinato', 'vamp', 'gitarrenriff', 'riffs', 'ovation', 'stehapplaus', 'beifallssturm', 'stehbeifall', 'ouvertüre', 'ouverture', 'opernouvertüre', 'konzert-ouvertüre', 'tempo', 'moltovivace', 'andanteespressivo', 'allegrorisoluto', 'moderato', 'adagionontroppo', 'andantesostenuto', 'andantemosso', 'maestoso', 'grave', 'tempobezeichnungen', 'allegromoderato', 'allegrosostenuto', 'allegromarcato', 'tempi', 'vivacissimo', 'allegrogiocoso', 'nontroppo', 'andantemaestoso', 'manontroppo', 'tempobezeichnung', 'vivace', 'adagietto', 'nontroppoallegro', 'andanteunpocotranquillo', 'ritardando', 'prestissimo', 'presto', 'virginal', 'muselaar', 'spinett', 'jungfräulichen', 'paarvirginals', 'panflöte', 'längsflötenspiele', 'pandeanrohr', 'Schnauff', 'stimme', 'stimmbuch', 'teil', 'vielstimmigergesang', 'mehrstimmigergesang', 'mehrstimmigemusik', 'vielstimmigemusik', 'partita', 'liedsatz', 'pasodoble', 'pavane', 'paduane', 'pavana', 'paduana', 'pavanas', 'paduan', 'schreittanz', 'payola', 'paytoplay', 'payforplay', 'schmiergeld', 'orgelpunkt', 'liegeton', 'tinwhistle', 'pennywhistle', 'lowwhistle', 'blechflöte', 'blechpfeife', 'irishwhistle', 'pentatonik', 'pentatonischeskala', 'fünftonmusik', 'fünfton-musik', 'pentatonisch', 'fünftonleiter', 'pentatonische', 'pentatone', 'rhythmusgruppe', 'rhythmussektion', 'rhythmsection', 'rhythmussection', 'perkussion', 'percussion-sektion', 'schlagzeug', 'rhythmus-sektion', 'philharmonie', 'philharmoniker', 'sinfonieind-moll', 'plattenspieler', 'phonograph', 'phonographen', 'jrammofohn', 'grammofon', 'walzenphonograph', 'phonograf', 'fonograf', 'edisonapparat', 'gramaphone', 'tonarm', 'turntables', 'pianissimo', 'pianist', 'klavierspieler', 'pianistin', 'klavierspielerin', 'klassischerpianist', 'konzertpianist', 'pianisten', 'klavierstunde', 'klavierunterricht', 'Klaviermusik', 'klaviersonate', 'klaviersonaten', 'duda', 'flöte', 'rohr', 'pipemajor', 'stimmpfeife', 'pitchpipe', 'pizzicato', '𝆭', 'pizzikato', 'plätschern', 'playlist', 'wiedergabeliste', 'wiedergabelisten', 'wiedergabe', 'playback', 'spiel', 'plumps', 'polstern', 'polka', 'polkas', 'polkamusik', 'polytonalität', 'polytonalism', 'bitonalität', 'polytonal', 'popmusik', 'pop', 'popsong', 'populärmusik', 'popmusiker', 'popularmusik', 'pop-musik', 'popgruppe', 'popsänger', 'darkpop', 'populäremusik', 'popsängerin', 'pop-song', 'pop-gruppe', 'beliebtemusikrichtung', 'popularism', 'nachspiel', 'präludium', 'praeludium', 'preludio', 'präludien', 'preludien', 'preludium', 'vorspiel', 'prélude', 'intrada', 'Vorhalt', 'primo', 'prozessionshymne', 'prosodion', 'prozessionswegmärz', 'recessionalmärz', 'programmmusik', 'psalmist', 'psalmisten', 'punk-rocker', 'punk-szene', 'punk', 'punk-subkultur', 'punk-bewegung', 'punk-kultur', 'punkrock', 'punk-rock', 'punk-rock-band', 'punkmusik', 'punkband', 'punk-band', 'punk-musik', 'punk-revival', 'reinenton', 'musikalischenton', 'musiktons', 'quadriphonicsystem', 'quadrophonie', 'quadrofonie', 'quadrophonie-system', 'quadraphonic', 'quadrille', 'quadrillen', 'klangfarbe', 'timbre', 'stimmfärbung', 'klangfarben', 'timbral', 'viertelpause', 'quartett', 'bläserquartett', 'vokalquartett', 'jazz-quartett', 'Kwartett', 'Quickstep', 'schweigen', 'geräuschlosigkeit', 'lautlosigkeit', 'ruhe', 'stillezeit', 'quintett', 'rhythmandblues', 'rhythm-n-blues', 'rhythm’n’blues', 'rhythm&blues', 'r’n’b', 'rnb', 'r&b', 'rbmusik', 'rb', 'rundb', 'rhythm-and-blues', 'rhythmblues', 'radau', 'ragtime', 'ragtimes', 'gerassel', 'rale', 'rasselnd', 'rapper', 'proto-rap', 'strömung', 'emceeing', 'rappen', 'rat-a-tat', 'rat-a-tat-tat', 'rat-tat', 'rave', 'rave-musik', 'Realisierung', 'neuordnung', 'reprise', 'Rekapitulation', 'rezital', 'recital', 'vortrag', 'solistin', 'erwägungsgrund', 'recitalist', 'rezitativ', 'seccorezitativ', 'recitativo', 'recitativosecco', 'secco-rezitativ', 'accompagnato-rezitativ', 'recitativoaccompagnato', 'rezitative', 'plattenfirma', 'plattenfirmen', 'musiklabel', 'großenplattenfirma', 'großenplattenfirmen', 'musik-label', 'musikunternehmen', 'major-label', 'sublabel', 'album-cover', 'plattencover', 'albumcover', 'schallplattencover', 'schallplattenhülle', 'coverartwork', 'plattenhülle', 'covertext', 'gatefold', 'linernotes', 'plattentasche', 'gatefoldcover', 'gatefold-cover', 'original-album-cover', 'blockflötistin', 'aufnahmestudio', 'musikstudio', 'tonstudio', 'regieraum', 'abhörraum', 'tonregie', 'tonregieraum', 'hörfunkstudio', 'soundstudio', 'radiostudio', 'aufzeichnungssystem', 'reedabschnitt', 'Reel', 'reel', 'rolle', 'scottishreel', 'reggae', 'reggae-musik', 'register', 'reharmonisation', 'veröffentlichung', 'release', 'musikveröffentlichung', 'musikrelease', 'religiösergesang', 'Reproduktion', 'bericht', 'wiedergabegerät', 'requiem', 'auflösung', 'Resonanz', 'pausenzeichen', 'pause', 'rest', 'rumba', 'rhythmusundblues-musiker', 'riff', 'rocknroll', 'rock', 'rockmusik', 'rockandroll', 'rock-n-roll', 'rock’n’roll', 'rock&roll', 'rockmusiker', 'rocksong', 'rock-nroll', 'rock-and-roll-', 'rockroll', 'rock-n-rollmusiker', 'rockband', 'rock-gruppe', 'rockgruppe', 'rock-konzert', 'rockoper', 'rock-oper', 'rockopern', 'metal-oper', 'rockstar', 'rockabilly', 'rockabilly-musik', 'rockabillymusik', 'rondo', 'ritornellform', 'kettenrondo', 'rondino', 'rondoform', 'rondeau', 'bogenrondo', 'sonatenrondo', 'rondo-form', 'zirkelkanon', 'runde', 'Runde', 'reigen', 'lizenzgebühren', 'royaltys', 'tantieme', 'lizenzgebühr', 'royalties', 'rubato', 'rubando', 'rubamentoditempo', 'temporubato', 'geflüster', 'rascheln', 'barockposaune', 'posaune', 'sackbut', 'renaissanceposaune', 'samba', 'batucada', 'pagode', 'sambacanção', 'samba-musik', 'shamisen', 'schamisen', 'samisen', 'shamise', 'naniwa-bushi', 'naniwabushi', 'Sarabande', 'saxophonist', 'saxophonistin', 'saxist', 'scat-gesang', 'scat', 'scat-singing', 'scatting', 'szene', 'scherzo', 'badinerie', 'badenerie', 'badinage', 'schottisch', 'schottische', 'kratzen', 'Scratch', 'kratzer', 'screaming', 'schreien', 'knirschen', 'secondo', 'abschnitt', 'satzteil', 'Sektion', 'dalsegno', 'segno', 'd.s.', '𝄉', 'Septet', 'Septett', 'sequenz', 'quartfallsequenz', 'quintschrittsequenz', 'quintfallsequenz', 'quartstiegsequenz', 'quintstiegsequenz', 'dominantkette', 'quintenfall', 'Serenade', 'serialismus', 'seriellemusik', 'seriellenmusik', 'seriellekomposition', 'sextett', 'Sextett', 'Sforzando', 'triller', '𝆖', 'kreuz', '♯', 'schalmei', 'musiknoten', 'shrilling', 'schärfe', 'stridence', 'snaredrum', 'kleinetrommel', 'rührtrommel', 'snare-trommel', 'rimshot', 'snare-drum', 'snare', 'schnarrtrommel', 'rim-shot', 'paradetrommel', 'schnarrsaite', 'snaredrums', 'fassseiten', 'titelmelodie', 'titelmusik', 'titellied', 'erkennungsmelodie', 'kennmelodie', 'tvtheme', 'titelsong', 'titelthema', 'titelsongs', 'singalong', 'sing-a-long', 'vokalist', 'sängerin', 'vokalistin', 'vokalpraxis', 'gesangsapparat', 'gesangsfach', 'singstimme', 'singapparat', 'gesangsstil', 'vokalisten', 'rocksänger', 'cleanenvocals', 'harmoniegesang', 'pop-sängerin', 'femalevocals', 'vocalizing', 'gesangstimme', 'sprach-klassifizierung', 'voice-klassifizierung', 'sitar-spieler', 'brutzeln', 'skiffle', 'skifflemusik', 'skifflegroup', 'Knall', 'moshpit', 'slamtanz', 'mosh', 'moshing', 'Schnipp', 'solfa', 'tonicsolfa', 'solfège', 'solfege', 'solfeggio', 'solfeggieren', 'Solfege', 'Solfeggio', 'solmisation', 'do-re-mi-fa-so-la-si-do', 'solmisieren', 'doremi', 'do-re-mi-fa-so-la-ti-do', 'do-re-mi', 'do', 'sol', 're', 'la', 'ti', 'fa', 'mi', 'so', 'solo', 'musiksolo', 'gitarrensolo', 'solist', 'sonate', 'sonata', 'cellosonate', 'kirchensonate', 'sonaten', 'sonatenform', 'sonatensatzform', 'sonatenhauptsatz', 'sonatenhauptsatzform', 'sonatensatz', 'seitenthema', 'hauptsatz', 'sonatine', 'song', 'bauerngesang', 'cantiorusticalis', 'beanspruchung', 'strapaze', 'stress', 'dehnung', 'anspannung', 'spannung', 'inanspruchnahme', 'druck', 'belastung', 'discant', 'sopranistin', 'sopranist', 'Sopran', 'sopranschlüssel', 'sordino', 'soul', 'soulmusik', 'soul-musik', 'nusoul', 'soundeffekt', 'soundkulisse', 'sound-effekt', 'klangeffekt', 'sound-effekte', 'tonwiedergabe', 'sputtern', 'sprechgesang', 'sprechstimme', 'square-dancemusic', 'Kreisch', 'zermatschen', 'notenlinien', 'notensystem', 'notenlinie', 'liniensystem', 'notenzeile', 'Presentation', 'stahlband', 'steelband', 'steelpan', 'stereophonie', 'stereo-system', 'stereo-musik-system', 'stereoanlage', 'stradivari', 'stradivarius', 'stradavarius', 'strad', 'streichorchester', 'streichquartett', 'streichquartette', 'streicherquartett', 'streicher', 'streichergruppe', 'saiten', 'stift', 'suite', 'suitensatzform', 'suiten', 'orchestersuite', 'übertitelung', 'übertitel', 'übertiteln', 'supertitle', 'sinfonie', 'symphonie', 'synphonie', 'sinfonien', 'symphonischemusik', 'tondichtung', 'sinfonischedichtung', 'symphonischedichtung', 'symphonist', 'Synkope', 'synkope', 'synkopierten', 'synkopen', 'syncopator', 'synthesizer', 'synthie', 'synthesizer-programmierer', 'analogsynthesizer', 'analogeklangerzeugung', 'klangsynthese', 'arpeggiator', 'bass-synthesizer', 'musik-synthesizer', 'ribbon-controller', 'synths', 'basssynth', 'synth-pad', 'synth-bass', 'hüllkurvengenerator', 'ta-ziyeh', 'tabulatur', 'griffzeichenschrift', 'griffschrift', 'lautentabulatur', 'norddeutscheorgeltabulatur', 'tamburin', 'tambourin', 'tambori', 'tambourdebasque', 'pandero', 'baskentrommel', 'schellentrommel', 'tamborí', 'tamburodibasque', 'buben', 'tango', 'ballroomtango', 'internationalertango', 'englischertango', 'standard-tango', 'europäischertango', 'taping', 'tonbandaufnahme', 'tonbandgerät', 'tonband', 'magnettongerät', 'bandmaschine', 'bandtongerät', 'hinterbandkontrolle', 'magnetophon', 'magnetophongerät', 'tapping', 'klopfen', 'tarantella', 'tarantelle', 'techno', 'technohouse', 'technomusik', 'tekkno', 'techno-musik', 'tenor', 'haute-contre', 'tenorespinto', 'tenorist', 'heldentenor', 'tenorstimme', 'lyrischertenor', 'dramatischertenor', 'tenöre', 'dramatischentenor', 'Tenor', 'tenorschlüssel', 'tenorsaxophon', 'tenorsaxofon', 'tenor-saxophon', 'tenorsaxophonist', 'tenorsaxophonisten', 'textur', 'tonsatz', 'tonsatzlehre', 'satztechnik', 'harmonielehresatz', 'historischesatzlehre', 'tonsatzkunde', 'theremin', 'ätherwellengeige', 'termenvox', 'thereminovox', 'thereminvox', 'aetherophon', 'moog-theremin', 'pauker', 'toccata', 'tokkata', 'fackelsängerin', 'torchsinger', 'torchsong', 'schmachtlied', 'schmachtsong', 'fackelsongs', 'tra-la', 'tra-la-la', 'trad', 'Aufzeignung', 'tremolo', 'tremolieren', 'amplitudenvibrato', 'Tremolo', 'triangel', 'trio', 'Trio', 'dreiertakt', 'imdreiertakt', '3/4takt', 'posaunist', 'posaunistin', 'posaunisten', 'trompetensektion', 'twist', 'ukulele', '-ukulele', 'ʻukulele', 'variation', 'themaundvariationen', 'variationen', 'variationform', 'vibraphonist', 'vibist', 'vibrato', 'bebung', 'frequenzvibrato', 'victrola', 'gambe', 'kniegeige', 'bassgambe', 'gamben', 'schoßgeige', 'dessusdeviole', 'divisionviol', 'gambist', 'pardessusdeviole', 'diskantgambe', 'lyraviol', 'gambistin', 'viol', 'viola', 'bratsche', 'vla.', 'armgeige', 'altgeige', 'bratschen', 'violad-amore', 'violad’amore', 'violinod-amore', 'liebesgeige', 'violadabraccio', 'bratschist', 'violaspieler', 'bratscher', 'viola-spieler', 'bratscherin', 'violaspielerin', 'bratschistin', 'viola-spielerin', 'virtuose', 'virtuosität', 'virtuos', 'virtuosein', 'Vokalmusik', 'vokalmusik', 'vokalstimme', 'Stimme', 'freiwillige', 'walkman', 'sonywalkmanf800', 'sonywalkman', 'walzer', 'walzermusik', 'walzertakt', 'hochzeitsmarsch', 'hierkommtdiebraut', 'hochzeitmusik', 'weddingmarch', 'pfeifen', 'ganzerest', 'arbeitslied', 'worksong', 'xylophonist', 'jodeln', 'jodler', 'jodellied', 'naturjodel', 'alpenländischesjodeln', 'zimbel', 'zill', 'zymbel', 'zydeco', 'zydecomusik', 'begleiten', 'heraushauen', 'schlagen', 'taktschlagen', 'Hornspielen', 'straßenmusikmachen', 'rezitieren', 'Akkordespielen', 'harmonisieren', 'tuckern', 'kläppern', 'knallen', 'kontrapunktieren', 'jaulen', 'leisesingen', 'Diskantsingen', 'erniedrigen', 'trommeln', 'fiedeln', 'hinknallen', 'harmonieren', 'Harfespielen', 'beruhigen', 'choralieren', 'instrumentieren', 'invertieren', 'stimmen', 'madrigalieren', 'Lärmmachen', 'melodieren', 'Fehlermachen', 'spielen', 'plumpsen', 'präludieren', 'antizipieren', 'rauschen', 'quinkelieren', 'realisieren', 'reharmonisieren', 'wiederholen', 'inPartiturbringen', 'aufMusiksetzen', 'erhöhen', 'vomBlattsingen', 'mitsingen', 'schwappen', 'binden', 'solieren', 'schwingen', 'symphonisieren', 'synkopieren', 'aufnehmen', 'transkribieren', 'transponieren', 'acappella', 'begleitet', 'atonalisch', 'beethovenisch', 'cantabile', 'chorisch', 'chromatisch', 'schmutzig', 'dreckig', 'unsauber', 'verdreckt', 'unrein', 'verschmutzte', 'schmutzigen', 'dissonant', 'euphonisch', 'erste', 'erniedrigt', 'homophonisch', 'zunehmend', 'gestimmt', 'larghissimo', 'lentissimo', 'lento', 'schwingend', 'lyrisch', 'Dur', 'mensuriert', 'melodiös', 'melodisch', 'Moll', 'monodisch', 'monophonisch', 'musikalische', 'unalteriert', 'geräuschlos', 'pianistisch', 'sanft', 'polyphonisch', 'leise', 'ruhig', 'still', 'lärmend', 'pfeifend', 'zweite', 'schrill', 'erhöht', 'lautlos', 'singbar', 'langzam', 'weichfüßig', 'tonal', 'tonikaverwandt', 'unbegleitet', 'unmusikalisch', 'wagnerianisch', 'accelerando', 'geschwindiger', 'legato', 'sehrleise', 'geräuschvoll', 'staccato'];
var lexiconES = ["dodecafónico","dodecafonismo","dodecafonía","música dodecafónica","canto a capela","oído absoluto","oído perfecto","afinación perfecta","accidental","accidente","alteración","alteración musical","acompañamiento","acompañamiento musical","música de acompañamiento","acompañante","acordeón","acordeonista","rock ácido","blues ácido","pop psicodélico","rock psicodélico","gramola","gramófono","guitarra acústica","adagio","arreglista","adopción","arpa eolia","harpa eolia","arpa eólica","aficionado","black music","música afroamericana","música afroestadounidense","ccanciones de música afroamericana","aspectos de la música afroamericana","aire","cuerda","tonada","ton","línea","melodía","línea melódica","disco musical","álbum","álbum musical","álbum de música","álbum de estudio","álbum discográfico","alla breve","alegreto","allegretto","alegreto","alegro","allegro","allegro","alto","contralto","alto","contratenor","viola clef","altosaxofonista","Amati","órgano americano","distorsiónnolineal","entretenimiento","diversión","andante","andante","himno","himno","hymnus","antífona","rezo cantado","antífona","antifonía","aplaudir","aplauso","palmadas","palmada","palmas","plauso","aria","aria corta","arietta","arieta","arioso","acorde quebrado","arpeggio","arpegios","arpegio","arreglo musical","arreglos musicales","arreglo","adaptación","arreglo","transcripción","rock experimental","rock progresivo","prog rock","atonalidad","atonalismo","música atonal","audio","sonido","volumen","grabacióndesonido","grabacióndeaudio","audio","sistema de audio","cinta de audio","prueba","audición","percepción del sonido","sonido","sentido del oído","sensación auditiva","cambia discos","cambiadiscos","cambiador de discos","cambiador automático","arte de vanguardia","avant garde","ismos","vanguardias","vanguardismo","vanguardista","vanguardia artística","vanguardias históricas","ritmodefondo","bagatela","cornamusa","gaita","flautista","gaitero","balalaica","balalaika","balada","poema narrativo","baladista","cancionista","compositor de canciones","compositor","balada","baladista","ballet","músicadebaile","estallido","golpe","zarpazo","zumbido","explosión","percusión","banda","grupo","orquesta de baile","orquesta ligera","director de banda","lider de banda","líder de banda","director de banda","director de orquesta","músico mayor","bandoneón","músicodebanda","escolión","músicaparabanquete","compás","barra","barra de compás","cuartetodebarbershop","barbershop","barcarola","barítono","barítono","vozdebarítono","bombardino","barítono","bombardino barítono","organillo","organito","zanfoña","cinfonía","zanfonía","bajo","grave","sonido grave","bajo","bajo","bajo","base","clarinete bajo","clavedefa","bombo","gran casa","grancassa","contrabajista","contrabajo","doble bajo","violón","bajo","guitarra baja","guitarra bajo","bajo eléctrico","gamba","viola de gamba","clarinete tenor","heckelfono","eckelfón","oboe barítono","bajista","guitarrita","bajo cifrado","continuo","bajonista","fagotista","fagot","batuta","cadencia","metro","pulso","ritmo musical","ritmo","tiempo","compás","agógica","rítmica","rítmico","células rítmicas","be bop","be bop","bebop","bopper","bop","beguine","bel canto","belcantismo","belcantista","campanero","álbum tributo","álbum homenaje","concierto benéfico","nana","canción de cuna","big band","estridencia","estruendo","fragor","jaleo","cacofonía","estrépito","blue note","nota de blues","notas de blues","blue grass","bluegrass","blues","bolero","bombarda","badajo","hueso","maracas","platillos","castañuelas","boogie woogie","boogie woogie","boogie","bugui bugui","bugui","libreto","musical","trama","guión","boombox","radio grabador","radiocasetera","radiocasete","radiocaset","radiograbador","reproductor de casetes","ópera bufa","ópera buffa","ópera cómica","bourdon","nota pedal","pedal","bordón","sección de metal","banda de viento metal","brass band","bravura","alboroto","barahunda","batahola","bullicio","gresca","grita","guachafita","guirigay","jaleo","rebullicio","tole","zurriburri","algarabía","greguería","aficionada","aficionado","amante","apasionada","apasionado","entusiasta","fanática","fanático","cornetista","corneta","country and western","country music","country","música country","clavedeC","cabaret","club nocturno","cabaré","espectáculo en vivo","cadencia","cadencia","cadenza","baile cakewalk","cake walk","cakewalk","danza cakewalk","calíope","cantarina","canon","cantada","cantata","oratorio","canticum","cántico","cántico litúrgico","cantor principal","cantor","capiscol","maestro de coro","cantus firmus","capriccio","capricho","carrillonero","carioca","carioca","villanciquero","canto de villancicos","cascabel","magnetófono de casete","castrados","castrati","castrato","celesta","chelista","violoncelista","violonchelista","cello","chelo","violoncello","violoncelo","violonchelo","violón","música de cámara","orquesta de cámara","canto","cántico","canto litúrgico","caramillo","punteiro","saloma","entonación","traqueteo","tableteo","canturreo","trinodepájaros","voz de pecho","canto coral","conjunto vocal","coral","coreuta","coro mixto","coro","orfeón","agrupación coral","consort de instrumentos","consort","niño cantor","niño de coro","preludio coral","corista","coral","coro","coro","estribillos","estribillo","coro griego","coro","escala cromática","escala dodecáfona","escala duodécuple","música sacra","música sagrada","música litúrgica","música religiosa","cistro","citole","guiterna","cítara","claqueteo","palmada","estruendo","estrépito","clarinetista","clarinete","música culta","música docta","música seria","música clásica","música selecta","música académica","música orquestal","estrépito","clavicordio","manicordio","teclado","clave musical","clave","cierre","final","conclusión","cierre del telón","coda","final","color","coloración","coloratura soprano","coloratura","soprano de coloratura","coloratura","banda de jazz","grupo de jazz","jazz band","jazzband","retorno","reaparición","alboroto","barrila","bullicio","cacao","disturbio","movida","revoloteo","ruido","ruptura","sarao","tomate","trapisonda","trastorno","tumulto","lío","agitación","confusión","conmoción","perturbación","compositora","compositor","compositor de música","compositora de música","composición","pieza musical","pieza","composición","composición musical","composición de música","disco conceptual","álbum conceptual","concierto","recital","actuación","representación","concierto de música","banda sinfónica","banda de música militar","banda de música sinfónica","tono de concierto","diapasón","polifonía","polifónica","polifónico","concertina","acordeón","concierto","concerto grosso","concierto grosso","dirección de orquesta","conducción de orquesta","director de orquesta","directora de orquesta","conga","tumbadora","tambó","conga de salón","contra fagot","contrafagot","contrabajón","contralto","contrapuntista","cool jazz","cool","cuerno inglés","trompetero","trompetista","contrapunto","música contrapuntística","contratenor","courante","versión","arrullo","canto de cuna","nana","canción de cuna","crujido","crescendo","cantosuave","canturreo","cantomelódico","cantoromántico","mezcladeestilos","fusióndeestilos","nota negra","semimínima","pista","cimbalero","cimbalista","música de baile","danza de la muerte","danza macabra","cintadeaudiodigital","DAT","marcha fúnebre","decrescendo","diminuendo","discanto","desarrollo musical","diatónica","escala diatónica","dies irae","dies iræ","disminución","diminución","talán","talán talán","tolón tolón","tan","tan","dindondan","disco de vinilo","disco de vinil","disco vinilo","plato","registro","vinilo","grabación en vinilo","disk jockey","diskjockey","disyoquei","disyoquey","dj","pinchadiscos","pincha","disco","música disco","disonancia","estruendo","ruido","estrépito","saturación","cancioncilla","cantinela","tonadilla","diva","prima donna","prima dona","primadona","divertimento","divertissement","serenata","doo wop","doblebarra","tiempo acentuado","compás acentuado","canciónparabeber","tambor mayor","bastonera","batonista","majorette","redobledetambor","rub a dub","rataplán","baterista","tamborilero","tambor","batería","ensayo","mezcla","dub","dúo","dueto musical","dueto","dúo","dúo musical","eightsome","guitarra eléctrica","órgano","órgano hammond","órgano eléctrico","órgano electrónico","instrumento musical electrónico","bis","encore","canonenigmático","banda","conjunto","grupo","episodio","folclore","folk","música folk","música folclórica","música tradicional","música étnica","estudio","étude","bombardino","eufonio","euphonium","tuba tenor","música","eufonía","euritmia","explosión","exposición","improvisación","fado","falsete","voz de cabeza","fanfarria","fantasía","fermata","calderón","violín","violín tradicional","violinista","violín","pífano","flauta de pico","flauta dulce","rechifla","silbido","siseo","flamenco","guitarraflamenca","bemol","flautista","flauta","fiscornio","fiscorno","canción tradicional","canciónfolk","canciónpopular","fortissimo","forte","pianoforte","piano","fugato","fuga","análisis de una fuga","funk","música funk","clave de sol","gambista","gamelán","gama","escalaincompleta","estruendo","tumulto","gavotte","gavota","género musical","género de música","subgénero musical","gestalt","bolo","concierto","actuación","giga","orfeón","glisando","glissando","juego de timbres","lira","campanólogo","armónica de metal","viejoéxito","coro de gospel","gospel","música gospel","gradual","granópera","chirrío","canto gregoriano","canto llano","rechinamiento","bajorítmico","fan","groupie","redoble","retumbo","ruido sordo","ruido","gruñido","oink","Guarnerio","guitarra","púa","guitarrero","guitarrista","guitarra","habanera cubana","habaneras","havaneres","silenciodeblanca","aleluya","hallelujah","congratulación","baqueta","escobilla","baqueta de batería","aplauso","aplauso","hare krishna","mantra hare krishna","mantra hare krisna","armónico","armonización","armonización","armonizador","armonio","harmonio","órgano","armónium","armonía","armonía musical","arpa","arpista","clavecinista","clavicembalista","clavicordio","harpsicordista","óboe","guitarradeacero","steel guitar","voz masculina","heavy metal","heavy metal","rock metálico","música metálica","música heavy metal","alta fidelidad","hi fi","hifi","highland fling","danzadelasespadas","música hillbilly","música country","hip hop","rap","música hip hop","homofonía","homofónica","trompista","hornpipe","hosanna","hot jazz","aullido","tarareo","zumbido","canturrear","personaquetararea","zumbador","canturrear","tararear","calma","quietud","silencio","tranquilidad","salmodia","materia","tema musical","tema","tema melódico","pastoral","impromptu","música de escena","música incidental","música instrumental","música instrumental","instrumentista","músico","instrumentación","orquestación","instrumentación","instrumentación musical","intermezzo","intermezzo","entonación","intro","introducción","canto de inicio","introitus","introducción","canto de introducción","inversión","inversión musical","ipod","jam session","tintineo","cascabeleo","jazz","danza jazz","jazz","jazzman","músico de jazz","arpa de boca","guimbarda","arpa de mandíbula","swing","música swing","jook joint","juke joint","cantina con gramola","jug band","grupo de instrumentos informales","karaoke","guiro gaditano","kazoo","cazú","pito de caña","atabal","timbal de concierto","timbal grande","timbal","tímpano","tímpanos","clave","llave","sistema tonal","tonalidad","tono","instrumento de teclado","teclado","tecladista","teclista","doble","knell","toque de difuntos","koto","intérprete de koto","kwela","lp","long play","elepé","disco larga duración","lagerfono","lagerphone","landler","larghetto","largo","partitura de jazz","línea adicional","leit motiv","leit motiv","leitmotif","leitmotiv","motivo","libretto","libreto","guión teatral","kunstlied","lieder","lieds","lied","cantante de lieder","operetta","opereta","tonillo","melodía","swing","letanía","canción de amor","laudista","tañedor de laúd","lira","liricidad","lirismo","macumba","madrigal","madrigalista","escala mayor","modo mayor","tonalidad mayor","modo jónico","escala diatónica mayor","mambo","mandola","maracas","maraca","marcha militar","marcha","banda de marcha","mariachi","marimba","xilofón","silófono","xilófono","himno de francia","la marsellesa","himno nacional francés","marcha militar","música marcial","música militar","misa","mazurca","mazurka","piano de manubio","pianola","piano mecánico","mezcla","pastiche","popurrí","melodiosidad","melodía","melodía","percepción musical","meno mosso","metalero","compás","métrica","pulsación","metrónomo","mezzo soprano","mezzo soprano","mezzosoprano","soprano media","mezzosoprano","escala menor","modo menor","tonalidad menor","escala diatónica menor","juglaría","juglería","minueto","jazz moderno","neojazz","modulación","transición","monodía","monódico","monofonía","música monofónica","moonwalk","fragmento","motete","motivo musical","motivo","movimiento","gaita francesa","música","música","caja de música","cajón de música","cajita de música","crítico musical","atril","sillas de música","drama musical","conjunto musical","ensemble","agrupación musical","notación musical","sistema de notación musical","nota musical","nota","nota de música","pasaje","percepción musical","actuación musical","frase musical","fraseo","frase","escala musical","escala","gama","partitura","marca de tiempo","compás","compás musical","indicación de compás","musicalidad","músico","con sordino","sordina","nasalidad","himno nacional","himno","canto espiritual","espiritual negro","espiritual","nocturno","serenata nocturna","bullicio","ruido","nota","obligado","obbligato","obligado","obbligato","oboe d'amore","oboe de amor","oboe de caza","oboe","oboísta","octeto","octava","octeto","tiempo no acentuado","compás no acentuado","ópera","estrella de ópera","orquesta","foso de orquesta","foso","orquestación","órgano","organista","ostinato","ostinado","ovación","obertura","tempo","tiempo musical","tiempo","espineta","virginal","antara","flauta de pan","zampoña","resuello","particella","parte","voz","parte del canto","parte de la música","partita","partita","part song","partsong","pasodoble","pavana","payola","pedal","flauta irlandesa","silbato","flauta metálica irlandesa","pentatone","pentatónica","escala pentatónica","percusión","sección de ritmo","sección de percusión","percusionista","filarmónica","orquesta sinfónica","tocadiscos","fonógrafo","pianissimo","piano","pianista","lección de piano","partitura para piano","sonata para piano","sonata para teclado","flauta","gaitero mayor","diapasón","pizzicati","pizzicato","chapoteo","playlist","lista de reproducción","playback","reproducción","tocar","plonk","paf","plum","polca","polka","multitonalidad","politonalidad","politonalismo","música pop","pop","grupo de pop","música popular","popularismo","postludio","preludio","preparación","primo","prosodio","marcha procesional","música programática","salmista","punk","punk","música punk","tono","cuadrafonía","cuadrilla","cualidad","timbre","tono","silenciodenegra","cuarteto","cuarteto de música","cuarteto","paso rápido","silencio","quinteto","quinteto","quinteto de música","rhythm&blues","rhythm & blues","rhythm and blues","estruendo","estrépito","ragtime","tiempo sincopado","traqueteo","rapero","catante de rap","toc toc","tantarán","tantarantán","rave","música rave","realización","realización","reorganización","recapitulación","reexposición","recital","concertista","estilo de recitativo","recitado","recitativo","compañía discográfica","discográfica","portada de disco","portada","carátula","grabador","estudio de grabación","sistema de grabación","sección de viento","reel","reel","reel escocés","reggae","registro","reharmonización","estreno","lanzamiento","publicación","publicación musical","canción religiosa","reproducción","estampido","reproductor","requiem","réquiem","resolución","resonancia","reverberación","pausa musical","pausa","silencio","rumba criolla","rumba","músico de rythm and blues","rifeo","riff","rock'n'roll","rock and roll","rock & roll","rock","música rock","rockero","banda de rock","grupo de rock","concierto de rock","ópera rock","estrella de rock","estrella del rock","rockabilly","rockers","rondo","rondó","roulade","ronda","troll","ronda","redondilla","royalties","derechos de autor","regalía","rubato","tempo rubato","crujido","murmullo","susurro","frufrú","sacabuche","samba","samisen","shamisen","zarabanda","saxofonista","saxo","saxofón","saxófono","scat","escena","scherzo","chotis","chirriante","chirrido","rascadura","arañazo","chirrido","grito","crujido","secondo","apartado","parte","sección","sección","dal segno","segno","septeto","septeto","serie","sucesión","serenata","modos seriales abiertos","serialismo","música serial","sexteto","sexteto","sforzando","trinado","trino","sostenido","caramillo","chirimía","partitura","chillido","estridencia","caja clara","caja orquestal","caja","sintonía","sintonía musical","acompañamiento","cantante","cantora","cantor","vocalista","cantar","cante","canto","voz","músico de sitar","chisporroteo","skanking","contoneo","skiffle","jazz callejero","grupo de skiffle","grupo de jazz callejero","golpe","portazo","moshing","mosh","rockanrolear","deslizamiento","chasquido","crujido","solfa","solfeo","solmisación","solfeo","notación latina","notación musical latina","sistema latino de notación musical","solo","solista","sonata","forma de sonata","forma sonata","sonatina","canción","vocal","canto","son","canción","cantante","soprano","cantante soprano","soprano","clave de soprano","sordina","sordina para violín","soul","efecto de audio","efecto de sonido","efecto sonoro","reproducción de sonido","chisporroteo","chorreo","salpicadura","sprechgesang","sprechstimme","música para square dance","graznido","chapoteo","pauta musical","pauta","pentagrama","exposición","banda de tambores metálicos","estéreo","sistema estereofónico","stradivarius","orquesta de cuerdas","orquesta de cuerda","cuarteto de cuerdas","cuarteto de cuerda","sección de cuerda","sección de cuerdas","estudio","aguja","estilete","partita","suite orquestal","suite","sobretítulo","subtítulo","aumento","incremento","sinfonía","música sinfónica","poema sinfónico","sinfonista","compositor de sinfonías","síncopa","síncopa musical","ritmo sincopado","síncopa","sincopación","melodía sincopada","músico de síncopa","sintetizador","ta'ziyeh","tazié","tablatura","pandereta","pandero","tango","cassete","cinta","grabadora","reproductor de cinta","magnetofón","magnetófono","golpeteo","tarantella","tarantela","tarantella","tarantela","música tecno","tecno","tenor","voz de tenor","tenor","clave de tenor","clave de do","saxo tenor","saxofón tenor","textura musical","textura","tema principal","ceremin","teremin","theremin","eterófono","cantante femenina","ruiseñor","timbalero","tocata","toccata","cantante de baladas","balada","tra la la","trad","jazz tradicional","transcripción","tremolo","trémolo","trémolo","triángulo","trío","trío","compás ternario","trombonista","trombón","sección de trompeta","twist","ukelele","ukulele","improvisación","tema con variaciones","variación","vibrafonista","vibrato","victrola","vitrola","viola de gamba","viola","violín alto","viola de amor","viola da braccio","sección de violín","viola","músico de viola","virtuosista","virtuoso","música vocal","vocal","música vocal","voz","parte para voz","voz","voluntary","walkman","vals","cantor","marcha nupcial","chiflido","silbido","silencio de redonda","magnetófono de alambre","canción de trabajo","xilofonista","yodel","canto tirolés","cantante de yodel","crótalos","chinchines","zydeco","acompañar","aporrear","golpetear","martillear","tamborear","tamborilear","golpetear","marcar el ritmo","marcar el ritimo","dar golpes","marcar ritmo","deslumbrar","resplandecer","bailar boogie boogie","traqueteo","tembleteo","tocar la corneta","tocar música en la calle","busk","cantar","entonar","salmodiar","entonar","tocar las cuerdas","acordar","armonizar","concordar","congeniar","resoplar","hacer estruendo","rechinar","hacer un sonido metálico","restallido","componer","escribir","contrapuntear","chasquear","crujir","restallar","castañetear","aullar","chirriar","crujir","rechinar","canturrear","cantar al contrapunto","hacer gorgoritos","cantar en contrapunto","pinchar","bajar","engravecer","tocar el tambor","tamborilear","tocar el violín","tocar el violín","golpetazo","retumbar","armonizar","armonizar","tocar el harpa","canturrear","tararear","zumbar","apaciguarse","callarse","serenarse","tranquilizarse","cantar un himno","instrumentar","invertir","tocar jazz","bailar el jive","afinar","cantar madrigales","hacer ruido","resonar","proponer una melodía","tocar erróneamente","orquestar","tocar la flauta","tocar el harpa","ejecutar","interpretar","tocar","interpretar","tocar","hacer plaf","estallar","reventar","preludiar","preparar","preparar","murmurar","gorjear","trinar","alborotar","tocar ragtime","golpetear","matraquear","repiquetear","golpetear","repiquetear","realizar","reharmonizar","volver a tocar","ejecutar riffs","girar","rodar","escribir una partitura","instrumentar","musicar","agudizar","canto a primera vista","cantar","cantar en conjunto","son","tocar la cornamusa","chapotear","ligar","solo","swing","tocar con swing","sinfonizar","sincopar","grabar","registrar","transcribir","transportar","a capela","acompañado","allegretto","allegro","andante","antifonario","antifonal","arioso","atonalístico","beethoveniano","cantabile","canto recitado","coral","cromático","diatónico","contaminado","sucio","disonante","eufónico","primer","bemol","funky","armónico","homófono","homofónico","música creciente","jazzístico","ritmo de jazz","en clave","larghetto","larghissimo","lentissimo","lento","melodioso","ondulante","lírico","cantante lírico","lírico","lírico","mayor","mensural","melodioso","melódico","melodioso","menor","monódico","monófono","monofónico","musical","natural","silencioso","pianissimo","pianístico","piano","suave","modular el tono","ajustar el tono","polifónico","politonal","callado","calmado","alborotador","aflautado","segundo","agudo","estridente","penetrante","sostenido","silencioso","silente","cantable","lento","paso silencioso","solo","tenor","tonal","tónico","sin acompañamiento","inarmónico","wagneriano","accelerando","allegretto","allegro","andante","coralmente","armónicamente","en términos armónicos","legato","lento","lentamente","silenciosamente","en silencio","pianissimo","afiladamente","estridentemente","presto","silenciosamente","en silencio","estridentemente","de manera estridente","staccato"]
var lexiconFR = ['dodecaphonisme', 'dodécaphonie', 'dodécaphonisme', 'musique dodécaphonique', 'acappella', 'oreille absolue', 'oreille musicale', 'alteration', 'altération', 'accompagnement musical', 'accompagnement', 'accompagnateur', 'accordeon', 'akkordeon', 'akordeons', 'fisarmonica', 'accordéon', 'accordéon-piano', 'accordéoniste', 'acid rock', 'neo-psychedelia', 'psychedelic rock', 'rock psychedelique', 'rock-psyché', 'rock psyché', 'rock psychédélique', 'gramophone', 'guitare acoustique', 'guitares acoustiques', 'guitare sèche', 'adagio', 'arrangeur', 'emprunt', 'éole-harpe', 'éoli-harpe', "harpe d'éole", 'harpe à vent', 'harpe éolique', 'harpe éolienne', 'supporteur', 'musique noire americaine', 'musique noire', 'musique afro-américaine', 'musique noire américaine', 'air', 'melodie', 'mélodie', 'ligne mélodique', 'phrase mélodique', 'album de musique', 'album musical', 'album studio', 'albums studio', 'album', '2/2', 'alla breve', 'c barré', 'allegretto', 'allegro', 'contralto', 'haute-contre', 'contre-ténor', 'contreténor', 'clédeViola', 'saxophonistealto', 'Amati', 'orgue', 'distortion', 'divertissement', 'divertir', 'entertainment', 'andante', 'anthem', 'hymne', 'hymne religieux', 'chant sacré', 'antienne', 'antiphone', 'acclamation', 'applaudissements', 'applaudissement', 'clapping', 'aria', 'arietta', 'arioso', 'arpege', 'arpège', 'arpèges', 'arpège de guitare', 'arrangement musical', 'arrangements musicaux', 'arrangement', 'transcription', 'art rock', 'rock progressif', 'atonalisme', 'musique atonale', 'atonalité', 'son', 'enregistrementsonore', 'sonorisation', 'chaîne', 'cassetteaudio', 'audition', 'perceptionduson', 'registratoreautomatico', 'avant-gardes', 'avant-garde', "l'avant-garde", 'backbeat', 'bagatelle', 'comuse', 'cornemuse', 'cornemuseur', 'cornemuseux', 'joueur de cornemuse', 'joueur de pipeau', 'joueuse de pipeau', 'balalaika', 'balalaïka', 'ballade', 'auteur-compositeur', 'autrice-compositrice', 'chanteur de charme', 'crooner', 'crouneur', 'ballet', 'musique entraînante', 'coup', 'groupe', 'orchestre', 'orchestrede', 'bandleader', 'chef de fanfare', "chef de l'harmonie", 'chefdemusique', "chefd'orchestre", 'bandoleon', 'bandoneon', 'peguri', 'bandoléon', 'bandonéon', 'bandonéons', 'bandoneon peguri système', 'musicien', 'battement', 'cognement', 'scolie', 'mesure', 'barre de mesure', "quartetd'hommechantantàcappella", 'barcarolle', 'barcarole', 'bariton', 'baryton-basse', 'baryton basse', 'baryton', 'saxhorn baryton', 'chifournie', 'orgue de barbarie', 'vielle a roue', 'vièle à roue', 'vielle à roue', 'basse', 'grave', 'partdebasse', 'base', 'bas', 'clarinette basse', 'clef de fa', 'clé de fa', 'grosse caisse', 'kick', 'contrebasse', 'guitare basse', 'basse électrique', 'basse éléctrique', 'guitare basse électrique', 'violedegambe', 'cor de basset', 'heckelphone', 'bassiste', 'basse figurée', 'basse chiffrée', 'bassoniste', 'basson', 'baguette blanche', "baguette de chef d'orchestre", 'baguette de direction', 'baguette', 'bâton', 'rhythme', 'rithme', 'rythme', 'tempo musical', 'tempo', 'temps', 'be-bop', 'be bop', 'bebop', 'bop', 'beguine', 'bel canto', 'sonneur', 'carilloneur', 'album hommage', 'gala de bienfaisance', 'berceuses', 'berceuse', 'big-band', 'big bands', 'big band', 'bigband', 'boucan', 'tapage', 'vacarme', 'blue notes', 'note bleue', 'blue grass', 'bluegrass music', 'bluegrass', 'blues', 'bolero', 'boléro cubain', 'bombarde', 'castagnettes', 'castagnette', 'boogie-woogie', 'script', 'scénario', 'comédie musicale', 'boombox', 'ghetto blaster', 'ghettoblaster', 'radio-cassette', 'radio cassette', 'radiocassette', 'opera buffa', 'opéra-bouffe', 'bourdon', 'cuivres', 'brass-band', 'brass band', 'fanfare', 'street band', 'bravoure', 'clameur', 'aficionado', 'inconditionnel', 'mordu', 'dévot', 'passionné', 'clairon', 'country & western', 'country rock', 'country', 'musique country', 'CléfdeDo', 'cabarets', 'cabaret', 'cadence harmonique', 'cadence', 'cadences', 'cadenza', 'cake-walk', 'cakewalk', 'calliope', 'rossignol', 'canon', 'kanon', 'cantata', 'cantate', 'oratorio', 'cantique', 'cantor', 'chantre', 'grand-chantre', 'grand chantre', 'chef de chœur', 'cantus firmus', 'capriccio', 'caprice', 'campaniste', 'carioca', 'chanteurdechantsdeNoel', 'choristedeNoel', 'chantdeNoel', 'grelot', 'magnétocassette', 'castrats', 'castras', 'castrat', 'celesta', 'célesta', 'violoncelliste', 'violoncelle', 'chambriste', 'musique de chambre', 'orchestre de chambre', 'chant', 'chalumeau', 'chanterelle', 'chanter', 'chanson de marins', 'chanson de marin', 'chansons de marins', 'chansons de marin', 'chant de marins', 'chant de marin', 'chants de marins', 'chants de marin', 'vents et marées', 'intonation', 'claquement', 'voix de poitrine', 'chant choral', 'chorale', 'ensemble vocal', 'chœur', 'consort', 'jeunechoriste', 'prélude de choral', 'chœureur', 'chœureuse', 'refrain', 'chromatisme', 'echelle chromatique', 'gamme chromatique', 'échelle chromatique', 'musique liturgique', 'musique religieuse', 'musique sacree', 'musique sacrée', "musique d'église", 'musiques sacrées', 'pièce liturgique', 'cister', 'cistre', 'cithare', 'citole', 'cittern', 'guiterne', 'zister', 'bruitmétallique', 'clarinettiste', 'art music', 'classique', 'musique classique', 'musique dite savante', 'musique savante', 'craquement', 'clavicorde', 'manichordion', 'manicordion', 'clavier', "clef d'ut", 'clef de do', 'clef de fa 4e', 'clef de sol', 'clef', 'clé', "clé d'ut", 'clé de do', 'clé de sol', 'clé de fa 4e', 'final', 'coda', 'finale', 'coloration', 'soprano colorature', 'soprano léger', 'coloratura', 'jazz band', 'orchestre de jazz', 'come-back', 'rentrée', 'brouhaha', 'commotion', 'kerfuffle', 'tumulte', 'désordre', 'compositeur de musique', 'compositeur', 'compositrice', 'composition', 'composition musicale', 'pièce', 'œuvre', 'album-concept', 'album concept', 'concept-album', 'concept album', 'concerts', 'concert', 'représentation', 'harmonie', 'musique militaire', "orchestre d'harmonie", 'orchestre militaire', 'musique à vent', '', 'chanson polyphonique', 'musique polyphonique', 'polyphonique', 'polyphonie', 'concertina', 'concerto', 'concerto grosso', "art du chef d'orchestre", "direction d'orchestre", 'direction musicale', 'direction', "baguette d'orchestre", "chef d'orchestre", 'cheffe d’orchestre', 'congacero', 'congas', 'conga', 'tumbadora', 'contrebasson', 'contrapontiste', 'cool jazz', 'jazz cool', 'cor anglais', 'cor anglet', 'cors anglais', 'english horn', 'cor anglé', 'trompettiste', 'cornettiste', 'contrapuntique', 'contrepoint rigoureux', 'contrepoint', 'courante', 'reprise', 'crescendo', 'chantonner', 'chanterdeschansonsdecharme', 'crossover', 'noire', 'quartdenote', 'piste', 'cymbalier', 'musique de danse', 'danse macabre', 'danses macabres', 'danza de la muerte', 'marche funèbre', 'decrescendo', 'déchant', 'développement', 'echelle diatonique', 'gamme diatonique', 'échelle diatonique', 'dies irae', 'dies iræ', 'diminution', 'ding-dong', 'disque microsillon', 'disque vinyle', 'disque', 'microsillon', 'registre', 'vinyle', 'd.j.', 'dee jay', 'deejay', 'disc-jockey', 'disc jockey', 'disc jokey', 'disk jockey', 'disque-jockey', 'djette', 'djing', 'djs', 'dj', 'platiniste', 'selecta', 'art disco', 'boite de nuit', 'costume disco', 'danse disco', 'disco art', 'disco dance', 'disco music', 'disco night', 'disco', 'musique disco', 'discothèque', 'bruit', 'dissonance', 'distorsion', 'chansonnette', 'diva', 'primadonna', 'divertimento', 'sérénade', 'doo-wop', 'doublebarre', 'temps fort', 'chanson a boire', 'chanson à boire', 'tambour-major', 'majorette', 'roulement de tambour', 'rub-a-dub', 'rataplan', 'drumbeat', 'batteur', 'tambour', 'répétition', 'duo', 'eightsome', 'guitare electrique', 'guitare électrique', 'guitare éléctrique', 'guitares électriques', 'orguamon', 'orgue electronique', 'orgue hammond', 'orgue électronique', "l'instrument electroanalogique", 'instruments électroniques', 'instrument électroanalogique', 'instrument de musique electronique', 'instrument de musique électronique', 'instruments de musique électronique', 'bis', 'encore', 'rappel', 'ensemble', 'épisode', 'musique traditionnelle', 'musiques traditionnelles', 'etude', 'étude', 'euphonium', 'sommerophone', 'tuba ténor', 'euphonie', 'eurythmie', 'explosion', 'exposition', 'improvisation', 'fado', 'falsetto', 'fausset', 'voix de fausset', 'voix de tete', 'voix de tête', 'morceau de bravoure', 'fantaisie', 'fantaisie littéraire', "point d'orgue", 'point d’orgue', 'fiddle', 'violon', 'violoniste', 'fifre', 'schwegel', 'flute à bec', 'flûte à bec', 'flûte à six trous', 'soufflement', 'sifflement', 'flamenco', '♭', 'bémol', 'flutiste', 'flûtiste', 'joueur de flûte', 'bugle', 'fluegelhorn', 'fluggelhorn', 'saxhorn soprano en si ♭', 'chansonfolk', 'forte', 'forte-piano', 'piano-forte', 'piano', 'fugato', 'fughetta', 'fugue', 'fuga', 'funk music', 'funky music', 'funky', 'funk', 'musique funk', 'gambiste', 'gamelan', 'gamme', 'échellegraduée', 'gavotte', 'genre de musique', 'genre musical', 'genres musicaux', 'liste des genres musicaux', 'liste des styles musicaux', 'style de musique', 'gigue', 'jig', 'glee club', 'glissandi', 'glissando', 'glissendi', 'carillon', 'glockenspiel', 'jeu de timbres', 'vieuxsuccès', 'godspel', 'gospel', "chant d'offertoire", 'graduale romanum', 'graduale', 'graduel', 'opera', 'grincement', 'chant gregorien', 'modulatio romana', 'plain-chant', 'plain chant', 'grégorien', 'chant grégorien', 'chants grégoriens', 'bassedefond', 'groupie', 'borborygme', 'gargouillement', 'grondement', 'grogner', 'Guarnerius', 'guitare', 'plectre', 'guitaristes', 'guitariste', 'habanera', 'havanaise', 'demi-repos', 'alleluia', 'hallelujah', 'halleluyah', 'alléluia', 'baguettes', 'oscar hammerstein ii', 'oscar hammerstein', 'lionel hampton', 'HareKrishna', 'harmonique', 'harmonisation', 'mettreenharmonie', 'harmonium', 'harmonio', 'harpe', 'harpiste', 'claveciniste', 'hautbois', 'steel guitar', "voix d'homme", 'heavy metal music', 'heavy metal', 'metal rock', 'metal', 'musique heavy metal', 'métal', 'Haute-fidélité', 'highland fling', 'old-time music', 'hip-hop', 'hip hop', 'musique hip-hop', 'musique hip hop', 'rap', 'homophonie', 'joueurdecornet', 'hornpipe', 'hosanna', 'hotjazz', 'hurlement', 'mugissement', 'bourdonnement', 'fredonnement', 'fredonneur', 'silence', 'calme', 'psalmodie', 'sujet', 'theme', 'thème', 'thème musical', 'pastoral', 'impromptu', 'musique de scene', 'musique de scène', 'instrumentdemusique', 'instrumental', 'musique instrumentale', 'instrumentiste', 'joueuse', 'joueur', 'musicienne', 'instrumentation', 'intermezzo', 'introduction', 'introït', 'renversement', 'iPod', 'faire un jam', 'improvisation collective', 'jam-session', 'jam sessions', 'jam session', 'jammin', 'jam', 'bœuf', 'bœuf rock', 'faire le bœuf', 'tintement', 'jazz', 'danse jazz', "danse modern' jazz", "modern'jazz", 'modern-jazz', 'modern jazz', 'mordern jazz', 'musiciendejazz', 'biqqung', 'campurgne', 'chang', 'citaro', 'drumbla', 'guimbarda', 'guimbarde', 'guyud', 'hanche-en-ruban', 'komus', 'maranzano', 'muxukitarra', 'shan kobyz', 'trompe-laquais', 'trompette tsigane', 'trunfa', 'ulibao', 'vargane', 'vargas', 'tochelé', 'märistysrauta', 'harpe à bouche', 'trompe de béarn', 'swing jazz', 'swing', 'barrel house', 'juke joint', 'jug band', 'karaoke', 'logiciel karaoke', 'karaoké', 'karaoké sur ordinateur', 'gazou', 'kazoo', 'kazou', 'timbales', 'timbale', 'musique tonale', 'tonalité', 'système tonal', 'instrument à clavier', 'clavieriste', 'claviériste', 'glas', 'knell', 'koto', 'joueurdekoto', 'kwela', 'long play', 'lp album', 'monkey stick', 'landler', 'larghetto', 'largo', 'lead sheet', 'lignedepartition', 'leit-motiv', 'leitmotive', 'leitmotivs', 'leitmotif', 'leitmotiv', 'libretto', 'livret de ballet', 'livret', "livret d'opéra", 'lieder', 'lied', 'chanteurdelied', 'opérette', 'shuffle', 'litanie', "chanson d'amour", 'lovesong', 'joueur de luth', 'luthiste', 'lyres', 'lyre', 'liră', 'lyrisme', 'macumba', 'madrigal', 'madrigaliste', 'gamme majeure', 'mode majeur', 'mambo', 'mandola', 'maraca', 'marche', 'musique de marche', 'mariachis', 'mariachi', 'marimbas', 'marimba', 'xylophones', 'xylophone', 'Marsigliese', 'messe', 'mazurka', 'piano mécanique', 'pastiche', 'pot-pourri', 'pot pourri', 'mélodieux', 'menomosso', 'fandemusiqueheavymetal', 'pulsation', 'metronome', 'metronom', 'metrónomo', 'métronome', 'mezzo-soprano', 'mezzo soprano', 'mezzosoprano', 'gamme mineure', 'mode mineur', 'spectacledeménestrels', 'menuetto', 'menuet', 'minuet', 'jazzmoderne', 'transition', 'chant monodique', 'monodie', 'musique monodique', 'moon walk', 'moonwalk', 'morceau', 'motets de johann sebastian bach', 'motets', 'motet', 'motif', 'mouvement', 'oboemusette', 'amateur de musique', 'dilettante', 'musique', 'mélomane', 'boite a musique', 'boite à musique', 'boîte-à-musique', 'boîte à musique', 'critiquemusical', 'pupitre', 'jeudechaisesmusicales', 'drameenmusique(?)', 'ensemble musical', 'groupe de musique', 'notation musicale', 'note de musique', 'note', "passaged'unmorceau", 'perceptiondelamusique', 'performancemusicale', 'phrase', 'echelle musicale', 'gamme musicale', 'échelle', 'échelle musicale', 'partition', 'chiffrage de mesure', 'signature de mesure', 'musicalité', 'silencieux', 'sourdine', 'rhinolalie', 'nasalité', 'hymne nationale', 'hymne national', 'hymnes nationaux', 'negro-spiritual', 'negro spiritual', 'nocturne', 'notturno', 'bruit ambiant', 'bruyant', 'le bruit', 'retentissement', 'obbligato', "hautbois d'amour", "oboe d'amore", 'hautboïste', 'octette', 'octuor', 'levé', 'opéra', 'divadegrandopera', "fosse d'orchestre", 'fosse', 'orchestration', 'orgue à tuyaux', 'organiste', 'ostinato', 'ovation debout', 'standing ovation', 'ouverture', 'indication de tempo', 'tempos', 'tempi', 'ottavino', 'virginale', 'virginal', 'flute de pan', 'flûte de pan', 'haleter', 'souffler', 'partie musicale', 'partie', 'voix', 'partdechant', 'partita', 'chanson à parties', 'paso-doble', 'paso doble', 'pasodoble', 'paso', 'pavane', 'payola', 'pedale', 'pédale', 'tin whistle', 'gamme pentatonique', 'musique pentatonique', 'pentatonique', 'systeme pentatonique', 'système pentatonique', 'théorie des musiques pentatoniques', ' gamme pentatonique', 'percussions', 'percussionniste', 'orchestre symphonique', 'philharmonique', 'phonographe', 'tourne-disque', 'électrophone', 'pianissimo', 'pianiste classique', 'pianiste', 'coursdepiano', 'musiquepourlepiano', 'sonate pour piano', 'galoubet', 'flutemajeure', 'diapason-sifflet', 'pizzicati', 'pizzicato', 'pizz', 'plouf', 'liste de lecture', 'listes de lecture', 'playlists', 'playlist', "liste d'écoute", 'playback', 'jouer', 'coulement', 'floc', 'bruitsourd', 'polka', 'polytonalite', 'polytonalité', 'musique pop', 'piano pop', 'pop musique', 'pop music', 'pop', 'groupe de pop', 'musique populaire', 'populaire', 'postlude', 'prélude', 'préludes', 'preparation', 'préparation', 'primo', 'hymneprocessionnel', 'programmemusicale', 'psalmiste', 'punk', 'punk rock', 'son musical', 'systèmequadriphonique', 'quadrille', 'timbre', "réposd'unquartdetemps", 'quartette', 'quatuor', 'quartet', 'quickstep', 'quintette', 'r&b', "r'n'b", "rhythm' n' blues", "rhythm'n'blues", "rhythm'n blues", 'rhythm & blues', "rhythm 'n' blues", "rhythm 'n 'blues", 'rhythm and blues', 'rnb', 'rythm&blues', "rythm'n'blues", "rythm'n blues", 'rythm and blues', 'tintamarre', 'rag time', 'ragtime music', 'ragtime', 'rag', 'crépitement', 'rappeuse', 'rappeur', 'rat-a-tat-tat', 'rat-a-tat', 'rat-tat', 'musique rave', 'rave', 'réalisation', 'réarrangement', 'réexposition', 'récapitulation', 'recital', 'récital', 'récitals', 'récitaliste', 'recitativo', 'récitatif', 'maisondiscographique', "pochette d'album", 'pochette', "studio d'enregistrement", "systèmed'enregistrement", 'anchesection', 'reel(quadrilleécossais)', 'reel', 'reggae', 'ré-harmonisation', 'parution', 'publication', 'sortie', 'chantsreligieux', 'réproduction', 'détonation', 'reproducteur', 'requiem', 'résolution', 'résonance', 'pause', 'rumba', "musicienderythm'n'blues", 'riff', 'musique rock', "rock'n'roll", "rock'n roll", 'rock & roll', "rock 'n' roll", 'rock and roll', 'rock', 'roqueur', 'groupe de rock', 'équipe', 'concertdurock', 'opéra-rock', 'rockeur', 'rockabilly', 'rondo', 'roulade', 'round', 'éclat', 'rondeau', 'redevance', 'rubato', 'chuchotement', 'sacqueboute', 'sacquebute', 'saqueboute', 'saquebute', 'samba', 'jabisen', 'shamisen', 'sarabande', 'saxophoniste', 'scat', 'scène', 'scène de ménage', 'badinerie', 'scherzando', 'scherzi', 'scherzo', 'scottische', 'scottish', 'rayure', 'égratignure', 'screaming', 'secondo', 'section', 'part', 'dal segno', 'septuor', "marche d'harmonie", 'marche harmonique', 'séquence', 'musique serielle', 'sérialisme', 'post-sérialisme', 'musique sérielle', 'sextuor', 'sforzando', 'trille', 'diese', 'sharp', '♯', 'dièse', 'chalemie', 'chalémie', 'strident', 'perçant', 'stridence', 'caisse-claire', 'caisse claire', 'caisses claires', 'caisse', 'indicatif musical', 'chantsenchoeur', 'chanteur', 'vocaliste', 'chants', 'voix chantée', 'sitariste', 'grésillement', 'skank', 'skiffle', 'groupedeskiffle', 'heurtement', 'mosh', 'glissade', 'solfège', 'solfege', 'représentation de la musique', 'solmisation', 'solo', 'soliste', 'sonates', 'sonata', 'sonate', 'forme-sonate', 'forme sonate', 'structure sonate', 'sonatine', 'chanson', 'pression', 'tension', 'soprane', 'soprano', 'clédesoprano', 'musique soul', 'soul music', 'soul rock', 'soulful', 'soul', 'bruitage', 'effet sonore', 'effets sonores', 'réproductiondessons', 'sprechgesang', 'parlé-chanté', 'parlé/chanté', 'caquetage', 'gargouillis', 'faireunbruitdesuccion', 'portees', 'portee', 'portée', 'portées', 'portée musicale', 'portées musicales', 'disposition des notes sur la portée', 'déclaration', 'groupedepercussionscaribéennes', 'stéréophonie', 'stradivarius', 'orchestre à cordes', 'quatuor à cordes', 'cordes', 'aiguille', 'saphir', 'pointedelecture', 'suite de danses', 'suite', 'sur-titres', 'surtitrage', 'surtitres', 'surtitre', 'ondulation', 'symphonie', 'poème symphonique', 'symphoniste', 'syncopation', 'syncope', 'chiffrage traditionnel des mesures', 'musicienquijouedujazzsyncopé', 'synthé', 'synthétiseur', 'logiciel de synthèse vocale', "Ta'ziyeh", 'tablature', 'tambour de basque', 'tambourin', 'tango', 'enregistrementsurcassette', 'magnetophone', 'magnétophone', 'lecteur enregistreur de cassettes', 'tapotement', 'tarantella', 'tarantelle', 'tarentella', 'tarentelle', 'free tekno', 'freetekno', 'musique techno', 'techno', 'tekno', 'ténor', 'ténorino', 'baryténor', 'clédeténor', 'saxophone tenor', 'saxophone ténor', 'grain', 'motifdelachanson', 'aetherophone', 'termenvox', 'terminvox', 'theramin', 'thereminvox', 'theremine', 'theremin', 'thérémin', 'thérémine', 'èthérophone', 'éthérophone', 'théréminovox', 'chanteuse', 'timbalier', 'timbalière', 'toccata', 'chanteurmélo', 'torch song', 'tra-la', 'tra-la-la', 'tradjazz', 'tremolo', 'trémolo', 'triangle', 'triángulo', 'trio', 'troisièmetemps', 'tromboniste', 'sectiondetrumpette(sectionddecuivre)?', 'twist', 'ukulele', 'ukulélé', 'yukulélé', 'youkoulélé', 'variations', 'variation', 'thème et variations', 'vibraphoniste\xa0', 'vibrato', 'Victrola', 'basse de viole', 'viola da gamba', 'viole de gambe', 'violes de gambe', 'alto violon', 'alto', 'violon alto', 'viole', "viole d'amour", "violes d'amour", 'sînekeman', 'viole d’amour', 'violadabraccio', 'bois', 'violiste', 'virtuoses', 'virtuose', 'musiquevocale', 'musique vocale', 'partievocale', "disposition de l'accord", 'voluntary', 'walkman', 'valse', 'fauvette', 'marche nuptiale', 'chœur des fiançailles', 'répos', 'enregistreuràfil', 'chant de travail', 'work-song', 'work song', 'xylophoniste', 'jodeln', 'jodler', 'jodle', 'yodel', 'yodle', 'yodl', 'jodleur', 'sagattes', 'cymbales á doigts', 'zarico', 'accompagner', 'jouerfort', 'battre', 'battreletempo', 'marquerlerythme', 'joueravecbrio', 'danserleboogie-woogie', 'cliqueter', 'jouerduclairon', 'jouerdanslarue', 'cantiller', 'entonner', 'accorder', 'harmoniser', 'faireunbruitmétallique', 'grincer', 'craquer', 'frapperdanssesmains', 'composer', 'écrireencontrpoint', 'gémir', '\xa0iodler', 'déchanter', 'faireleDJ', "baisserd'undemi-ton", 'bémoliser', 'tambouriner', 'jouerduviolin', 'jouerduviolon', 'applatir', 'gargouiller', 'harper', 'fredonner', 'baisser', 'muter', 'chanter un hymne', 'instrumenter', 'inverser', 'jouer du jazz', 'danser le jive', 'chanterlesmadrigaux', 'fairedubruit', 'réaliserunemélodie', 'maljouer', 'orchestrer', 'jouerlaflute', 'baratiner', 'éclater', 'jouerunprélude', 'préparer', 'murmurer', 'susurrer', 'chanteravecdestrilles', 'faireduboucan', 'jouerleragtime', 'réaliser', 'ré-harmoniser', 'rejouer', 'jouerunriff', 'rouler', 'écrireunepartitiondemusique', 'mettreenmusique', 'diéser', 'joueràvue', 'chanterenchoeur', 'chanterenmemetemps', 'jouerlacornemuse', 'lier', 'swinguer', 'mettreensymphonie', 'syncoper', 'enregistrersurcassette', 'transcrire', 'transposer', 'a cappella', 'accompagné', 'allégretto', 'antiphonaire', 'ayantunemélodie', 'atonal', 'beethovenien', 'beethovénien', 'cantabile', 'choral', 'chromatique', 'diatonique', 'dissonant', 'premiere', 'homophone', 'croissant', 'jazzy', 'encléde', 'larghissimo', 'lentissimo', 'lento', 'entrainant', 'lyrique', 'lirique', 'majeur', 'mesuré', 'mineur', 'monodique', 'monophonique', 'musical', 'naturel', 'pianistique', 'polytonale', 'tumultueux', 'fluté', 'deuxième', 'aigu', 'criard', 'quipeutetrechanté', 'lentement', 'feutré', 'tonal', 'tonique', 'sansaccompagnement', 'disharmonieux', 'wagnérien', 'accelerando', 'enchœur', 'demanièreharmonieuse', 'legato', 'sansbruit', 'stridemment', 'presto', 'doucement', "d'unevoixrauque", 'staccato'];
var lexiconNL = ['dodecafonie', 'twaalftoonstechniek', 'twaalftoonstelsel', 'twaalftoonssysteem', 'twaalftoonsmuziek', 'dodekafonie', 'atonale muziek', 'twaalftonige systeem', '12-toons systeem', '12-toons muziek', 'dodecaphonism', 'dodecafonische', 'a capella zang', 'a capella zingen', 'absoluut gehoor', 'volmaakt gehoor', 'absolute toonhoogte', 'een perfecte pitch', 'alteratie', 'accident', 'toevallig', 'voortekens', 'begeleiding', 'muzikale begeleiding', 'accompagnement', 'ondersteuning', 'steun', 'begeleidingsband', 'back-up band', 'begeleider', 'accompanyist', 'accordeon', 'harmonica', 'klavieraccordeon', 'accordion', 'squeeze-box', 'piano accordeon', 'accordeonist', 'pianoaccordeon', 'trekpiano', 'knijp doos', 'accordeons', 'psychedelische rock', 'acid rock', 'acidrock', 'psychadelic rock', 'grammofoon', 'draaitafel', 'pick-up', 'platenspeler', 'akoestische grammofoon', 'akoestische gitaar', 'acoustische gitaar', 'adagio', 'arrangeur', 'lenen', 'aeolusharp', 'windharp', 'eolische harp', 'eolisch lier', 'harp van aeolus', 'aficionado', 'fan', 'liefhebber', 'afro-amerikaanse muziek', 'zwarte muziek', 'ras muziek', 'melodie', 'melodieën', 'melodieen', 'lijn', 'kant', 'zangwijs', 'melodische lijn', 'melodische', 'melodische zin', 'album', 'plaat', 'muziekalbum', 'studioalbum', 'rockalbum', 'studioalbums', 'albums', 'record album', 'studio-album', 'debuut album', 'muziek-albums', 'studio-albums', 'alla breve', '2/2', 'doorgeslagen maat', 'allegretto', 'allegro', 'alt', 'contra-alt', 'contratenor', 'altus', 'alto clef', 'altviool clef', 'altist', 'altsaxofonist', 'altoist', 'altsaxofoon', 'altsax', 'Amati', 'diatonisch accordeon', 'amerikaanse orgel', 'pomp orgel', 'amplitudevervorming', 'niet-lineaire vervorming', 'amusement', 'vermaak', 'entertainment', 'vertier', 'verstrooiing', 'vermakelijkheid', 'kijkgenot', 'entertainers', 'onderhoudend', 'vermaken', 'andante', 'anthem', 'strijdlied', 'volkslied', 'anthems', 'hymne', 'lofzang', 'gezang', 'loflied', 'tussenzang', 'kerkzang', 'kerkgezang', 'cantus', 'hymnodist', 'hymnwriter', 'hymnist', 'hymnen', 'hymnographer', 'christelijke hymne', 'antifoon', 'antiphonale', 'antifonarium', 'polychoral', 'tegenzang', 'antifonen', 'applaus', 'handgeklap', 'klappen', 'handklap', 'applaudiseren', 'geklap', 'handclaps', 'aria', 'ariëtta', 'arietta', "aria's", 'korte aria', 'arioso', 'arpeggio', 'gebroken akkoord', 'gebroken drieklank', 'gebroken akkoorden', "arpeggio's", 'arpeggiation', 'arrangement', 'arrangeren', 'toonzetting', 'bewerking', 'zetting', 'arrangeurs', 'muzikaal arrangement', 'muzikale arrangement', 'regelen', 'transcriptie', 'regeling', 'progressieve rock', 'art rock', 'prog-rock', 'prog rock', 'artrock', 'neo-prog', 'progressive rock', 'progrock', 'art-rock', 'progressieve-rockband', 'progressieve-rockgroep', 'neoprog', 'progressieve-rock', 'new prog', 'progressieve hardrock', 'retro-prog', 'kunst pop', 'prog', 'nieuwe prog', 'atonaliteit', 'atonaal', 'atonale', 'atonalism', 'sont', 'geluid', 'geluidsopname', 'audio-opname', 'geluidsopnamen', 'audio opslag', 'geluidsopname en weergave', 'opgenomen geluid', 'geluidssysteem', 'omroepinstallatie', 'audiosysteem', 'audiotape', 'geluidsband', 'auditie', 'audities', 'cattle call', 'auditieve perceptie', 'geluidsperceptie', 'psycho-akoestisch model', 'auditieve waarneming', 'psychoakoestiek', 'klank', 'auditieve sensatie', 'wisselaar', '-wisselaar', 'opname-wisselaar', 'avant-garde', 'avant garde', 'avant-gardisme', 'new wave', 'voorhoede', 'avantgarde', 'avant-garde kunst', 'avant-gardistische', 'new wave muziek', 'backbeat', 'bagatelle', 'onbenulligheid', 'doedelzak', 'doedel', 'pijpzak', 'doedelzakspeler', 'doedelzakblazer', 'liervis', 'schelvisduivel', 'balalaika', 'ballade', 'power ballad', 'rock ballad', 'pop ballad', 'ballad', 'ballads', 'power ballads', 'songwriter', 'liedjesschrijver', 'liedschrijver', 'songwriters', 'songwriting', 'verzenmaker', 'tekstdichten', 'ballad maker', 'song-writer', 'refrein', 'crooner', 'crooners', 'crooning', 'smartlapzanger', 'volkszanger', 'balladeer', 'croon', 'ballet', 'balletmuziek', 'ballroom muziek', 'danceroom muziek', 'klap', 'slag', 'smak', 'ontploffing', 'stoot', 'bons', 'band', 'muziekgroep', 'groep', 'bandje', 'bar band', 'instrumentaal ensemble', 'muziek ensemble', 'muzikale band', 'solo-project', 'pop rock band', 'muzikaal ensemble', 'rock bands', 'pop band', 'solo-artiest', 'dansorkest', 'dance orchestra', 'dance band', 'bandleider', 'orkestleider', 'orkestleidster', 'kapelmeester', 'bandoneon', 'bandoneón', 'bandoneonist', 'muzikant', 'bonzend', 'skolion', 'scolion', 'banket lied', 'maat', 'driekwartsmaat', 'bar', 'maatstreep', 'maatregel', 'barbershop quartet', 'barbershop muziek', 'barcarolle', 'barcarole', 'gondellied', 'barcarola', 'bariton', 'baritons', 'lyrische bariton', 'tenorsaxhoorn', 'baritontuba', 'bariton hoorn', 'euphonium en bariton', 'draailier', 'draaiorgel', 'straatorgel', 'pierement', 'hurdygurdy', 'druif', 'hurdy gurdy', 'draaivedel', 'handdraaiorgel', 'grind orgel', 'orgeldraaier', 'hand orgel', 'bas', 'baspartij', 'basstem', 'basis', 'basso', 'bas zanger', 'basso buffo', 'basklarinet', 'bas-klarinet', 'bassleutel', 'f-sleutel', 'bass drum', 'bassdrum', 'base drum', 'base-drum', 'basdrum', 'basedrum', 'kick drum', 'bass drum pedaal', 'dubbele basdrum', 'gran casa', 'bass drums', 'contrabas', 'bas viool', 'basviool', 'staande bas', 'stier viool', 'contrabassist', 'basgamba', 'double-bassist', 'snarige bas', 'contrabassen', 'stand-up bass', 'basgitaar', 'elektrische basgitaar', 'bas gitaar', 'bassline', 'basgitaren', 'fretloze basgitaar', 'elektrische bas', 'viola da gamba', 'gamba', 'bassethoorn', 'basset-hoorn', 'heckelfoon', 'heckelphone', 'basset hobo', 'bassist', 'basgitarist', 'bassiste', 'bassisten', 'becijferde bas', 'basso continuo', 'continuo', 'fagottist', 'dirigeerstok', 'dirigeerstokje', 'stokje', 'ritme', 'beat', 'rhythme', 'cadans', 'puls', 'tempo', 'off-beat', 'muzikale ritme', 'ritmische', 'ritmes', 'ritmische eenheid', 'bebop', 'be-bop', 'bop', 'beebop', 'beguine', 'belcanto', 'bel canto', 'klokkenluider', 'tribute album', 'tributealbum', 'tribute-album', 'tribute albums', 'profiteren album', 'benefietconcert', 'berceuse', 'slaapliedje', 'slaaplied', 'wiegelied', 'slaapliedjes', 'slaapdeuntje', 'wiegeliedje', 'big band', 'bigband', 'big bands', 'jazz orkest', 'big band muziek', 'big-band', 'lawaai', 'geraas', 'gedruis', 'heibel', 'herrie', 'trammelant', 'leven', 'geschreeuw', 'misbaar', 'drukte', 'tekeergaan', 'pandemonium', 'rel', 'kabaal', 'rumoer', 'spektakel', 'schallen', 'schetterende', 'blue note', 'blue notes', 'bluegrass', 'bluegrass muziek', 'bluegrass band', 'blues', 'bleus', 'bluesmuziek', 'bluesman', 'bluesy', 'blues muziek', "bolero's", 'bolero', 'bombarde', 'bombarderen', 'castagnetten', 'castagnette', 'castañuelas', 'castanuelas', 'vinger bekkens', 'klepper', 'klepels', 'botten', 'boogiewoogie', 'boogie', 'boogie-woogie', 'land boogie', 'boogie woogie', 'script', 'musical', 'draaiboek', 'muziektheater', 'scenario', 'boeken', 'playscript', 'boek musical', 'muzikale boek', 'muzikale komedies', 'musical theater', 'musicals', 'gettoblaster', 'ghettoblaster', 'boom box', 'ghetto blaster', 'boombox', 'opera buffa', 'komische opera', 'bouffe', 'opera comique', 'buffo', 'opera bouffe', "komische opera's", 'bourdon', 'drone', 'loei', 'dreun', 'drone pijp', 'blazerssectie', 'blazers', 'brassband', 'brass band', 'blaaskapel', 'koperensemble', 'fanfares', 'bravoure', 'bravura', 'aanbidder', 'minnaar', 'beminnaar', 'hoornblazer', 'bugelspeler', 'country muziek', 'countryzanger', 'country en western', 'countrymuziek', 'country', 'country music', 'country & western', 'country-and-western', 'nieuwe country', 'c en w', 'nieuwe land', 'country western', 'klassieke country muziek', 'amerikaanse country muziek', 'country-western', 'land muzikant', 'land', 'country en western muziek', 'country  western', 'c-sleutel', 'cabaret', 'floorshow', 'cabaretprogramma', 'floor-show', 'kleinkunst', 'cabaretier', 'cabaretière', 'cabaretiere', 'conferencier', 'cabaratier', 'cabaretgroep', 'vloer tonen', 'cabarets', 'cadens', 'cadenza', 'authentieke cadens', 'perfecte cadans', 'cadensen', 'cakewalk', 'stoomorgel', 'stoomkalliope', 'kalliope', 'stoompiano', 'calliope', 'canon', 'kanon', 'caccia', 'cantate', 'oratorium', 'cantata', 'wereldlijke cantate', 'oratoria', 'kerkcantate', 'oratoriumvereniging', 'cantates', 'canticum', 'kantiek', 'cantiek', 'cantica', 'lied', 'voorzanger', 'cantor', 'koordirigent', 'dirigent', 'cantus firmus', 'cantus-firmus', 'capriccio', 'beiaardier', 'carioca', 'Carioca', 'caroller', 'caroler', 'caroling', 'schelringen', 'slee bel', 'cascabel', 'sleigh bells', 'cassetterecorder', 'cassettedeck', 'cassettespelers', 'casette recorder', 'cassette deck', 'casetterecorder', 'cassettespeler', 'castraat', 'castraatzanger', 'gecastreerde', 'castrato', 'castraten', 'celesta', 'celeste', 'cellist', 'violoncellist', 'cello', 'violoncello', 'celli', 'violoncel', 'violincello', 'violoncello piccolo', "cello's", 'kamermuziek', 'kamermusicus', 'kamerorkest', 'chant', 'chanting', 'deun', 'spreekkoor', 'zingen', 'gezangen', 'chanter', 'melodie pijp', 'melodiepijp', 'shanty', 'matrozenlied', 'zee chantey', 'zeemansliederen', 'zee shanty', 'ratelen', 'snateren', 'chest voice', 'borst register', 'borst stem', 'borst toon', 'borststem', 'koor', 'zangkoor', 'kerkkoor', 'koormuziek', 'koorwerk', 'jongerenkoor', 'koorzang', 'gemengd koor', 'cantorij', 'խմբերգ', 'kinderkoor', 'koren', 'vocaal ensemble', 'concert koor', 'consort', 'consort muziek', 'consortmuziek', 'koorknaap', 'chorale prelude', 'koraal prelude', 'koorzanger', 'chorus', 'keerzang', 'keervers', 'zich onthouden', 'grieks koor', 'rei', 'chromatische toonladder', 'chromatisch', 'melodische toonladder', 'kerkmuziek', 'religieuze muziek', 'gewijde muziek', 'liturgische muziek', 'kerkmusicus', 'citole', 'gittern', 'citer', 'zither', 'citter', 'cittern', 'cister', 'klak', 'gekletter', 'geschal', 'metaalklank', 'galmen', 'gerinkel', 'knal', 'clangoring', 'kletteren', 'klarinettist', 'klassieke muziek', 'kunstmuziek', 'geschiedenis van de westerse klassieke muziek', 'serieuze muziek', 'geschiedenis van de klassieke muziek', 'symphoniemuziek', 'klassiek', 'kunst muziek', 'klassieke musici', 'klassieke', 'westerse kunstmuziek', 'europese klassieke muziek', 'westerse klassieke muziek', 'geratel', 'klepperen', 'klavechord', 'klavichord', 'clavichord', 'pedaalclavichord', 'pedaalklavechord', 'klavier', 'sleutel', 'muzieksleutel', 'finale', 'besluit', 'slot', 'slotstuk', 'sluiten van gordijnen', 'conclusie', 'coda', 'codetta', 'coda-teken', 'koda', 'color', 'schakering', 'coloratuursopraan', 'lyrische coloratuursopraan', 'coloratuur', 'jazzband', 'jazzcombo', 'jazz combo', 'jazzorkest', 'jazz-band', 'jazz-orkestje', 'jazzgroep', 'combo', 'comeback', 'tumult', 'beroering', 'commotie', 'opschudding', 'consternatie', 'fermentatie', 'onrust', 'sensatie', 'keet', 'deining', 'hurly burly', 'to-do', 'hoo-hah', 'hoo-ha', 'componist', 'toondichter', 'opsteller', 'maker', 'auteur', 'filmcomponist', 'componiste', 'toonzetter', 'componeren', 'toonkunstenaar', 'toonkunstenares', 'toondichteres', 'compositie', 'muziekstuk', 'compositiekunst', 'muziekstukken', 'muzikale compositie', 'muzieknummer', 'compositieleer', 'stuk', 'opus', 'muziek compositie', 'concept album', 'conceptalbum', 'concept albums', 'concert', 'concerten', 'optreden', 'concertuitvoering', 'popconcert', 'muziekuitvoering', 'opvoeren', 'uitvoering', 'live muziek', 'live concert', 'tour', 'tournee', 'muziek concert', 'harmonieorkest', 'militaire band', 'militair orkest', 'blaasmuziek', 'militaire muziek', 'harmonisch orkest', 'harmonie', 'blazersensemble', 'militaire bands', 'blaasorkest', 'concert band', 'symfonische band', 'stemtoon', 'kamertoon', 'concert toonhoogte', 'stemtoonhoogte', 'a-440', 'filharmonisch toonhoogte', 'internationale veld', 'polyfonie', 'polyfone muziek', 'meerstemmigheid', 'vierstemmig', 'polyfoon', 'polyfone', 'gecoördineerde muziek', 'concertina', 'concerto', 'concerti', 'concerto grosso', 'concertino', 'dirigeren', 'uitvoeren', 'chef-dirigent', 'uitgevoerd', 'orkestdirectie', 'koordirectie', 'conga', "conga's", 'tumbadora', 'conguero', 'polonaise', 'conga lijn', 'contrafagot', 'dubbele fagot', 'contrafagotto', 'contrapuntist', 'cool jazz', 'cooljazz', 'engelse hoorn', 'althobo', 'cor anglais', 'alt-hobo', 'engels hoorn', 'engels horn', 'trompettist', 'cornetist', 'trommelduif', 'contrapunt', 'samenklank', 'contrapunctus', 'soort contrapunt', 'contrapuntische', 'contra-tenor', 'countertenoren', 'countertenor', 'counter-tenor', 'courante', 'cover', 'covers', 'coverversie', 'vertolking', 'cover versie', 'cover album', 'cover version', 'kraken', 'krakende', 'crescendo', 'aanzwellend', 'toenemend', 'dynamiek', 'croonen', 'crossover', 'crossover hit', 'cross-over muziek', 'klassieke crossover', 'kwartnoot', 'quarter note', 'track', 'cymbalist', 'dansmuziek', 'dancemuziek', 'dance', 'dodendans', 'danse macabre', 'dance of death', 'the dance of death', 'totentanz', 'dat', 'digitale audiotape', 'dodenmars', 'treurmars', 'begrafenismars', 'diminuendo', 'decrescendo', 'discant', 'Discantus', 'verwerking', 'ontwikkeling', 'musical development', 'muzikale ontwikkeling', 'diatonische toonladder', 'diatoniek', 'diatonisch', 'ladder', 'scala', 'schaal', 'toonladder', 'toonschaal', 'gamma', 'diatonische schaal', 'dies irae', 'diminutie', 'vermindering', 'ding-dong', 'grammofoonplaat', '78-toeren', 'grammofoonplaten', 'discus', 'draaischijf', 'bescheiden', 'papieren', 'plaatje', 'single', 'vinylplaten', '7', '7 vinyl', 'akoestische opname', 'vinyl single', '78 toeren', '7-inch single', '7 inch', 'record', 'vinyl schijf', '7 single', 'fonograaf opname', '78-toerenplaten', '7-inch', '78 toeren plaat', 'schijf', '78s', '45rpm', 'vinyl album', 'diskjockey', 'disc jockey', 'dj', 'disk jockey', 'deejay', 'diskjockeys', 'disk-jockey', 'discjockey', 'djane', 'radiodeejay', 'live dj', 'radio-diskjockey', 'radio-dj', 'jock', 'live-dj', 'disc jockeys', 'disc-jockey', 'radio deejay', 'selector', 'deejaying', 'deejays', 'disco', 'danspop', 'disco muziek', 'discomuziek', 'disco tijdperk', 'dissonant', 'ruis', 'wanklank', 'distortion', 'sneeuw', 'overstuurd', 'overstuurde', 'vervorming', 'distortion pedaal', 'fuzz gitaar', 'overdrive', 'fuzzbox', 'deuntje', 'diva', 'prima donna', 'primadonna assoluta', 'primadonna', 'prima donna assoluta', 'divas', "diva's", 'divertimento', 'serenade', 'divertimenti', 'zanghulde', 'serenata', 'doo-wop', 'doowop', 'doo wop', 'dubbele maatstreep', 'thesis', 'downbeat', 'drinklied', 'drinkliederen', 'tamboer-maître', 'tambour-maître', 'tamboer-maitre', 'tamboer-majoor', 'tambour-maitre', 'drum major', 'trommel grote', 'majorette', 'majorettes', 'tromgeroffel', 'tromroffel', 'paradiddle', 'roffel', 'rudiments', 'rudiment', 'rataplan', 'drumpatroon', 'trommelen', 'drum beat', 'drummer', 'drumspeler', 'slagwerker', 'tamboer', 'trommelslager', 'trommelaar', 'drummers', 'repetitie', 'dry run', 'dub', 'dub reggae', 'dub muziek', 'duet', 'duo', 'quatre-mains', 'eightsome', 'elektrische gitaar', 'electrische gitaar', 'elektrisch gitaar', 'dubbelhals', 'dubbelnek', 'gitaar met dubbele nek', 'elektrische gitaren', 'elektronisch orgel', 'hammond orgel', 'hammondorgel', 'elektronicum', 'hammond-orgel', 'electronicum', 'hammondinstrument', 'orgel', 'electronisch orgel', 'b3 orgel', 'thuis orgel', 'hammond b3 orgel', 'hammond b-3 orgel', 'elektrisch orgel', 'elektronisch muziekinstrument', 'elektronisch instrument', 'elektronische instrumenten', 'elektronische muziekinstrumenten', 'toegift', 'encore', 'volksrepubliek donetsk', 'raadselachtige canon', 'enigma canon', 'raadsel canon', 'raadselachtig canon', 'raadselcanon', 'ensemble', 'gebeuren', 'episode', 'etnische muziek', 'volksmuziek', 'folk', 'traditionele muziek', 'folk-music', 'wereldmuziek', 'folk-muziek', 'folkmuziek', 'pagan folk', 'volksliederen', 'folk band', 'tune', 'akoestische folk', 'folk-song', 'pop folk', 'folk muziek', 'folk muzikant', 'folk groep', 'etude', 'etudes', 'euphonium', 'eufonium', 'tenortuba', 'eufonium/euphonium', 'euphoniums', 'muziek', 'welluidendheid', 'eufonie', 'euritmie', 'eurithmy', 'ritmiek', 'eurythmics', 'explosie', 'expositie', 'improvisatie', 'improvisator', 'geïmproviseerde', 'improviseren', 'extemporisation', 'improvisaties', 'fado', 'kopstem', 'falset', 'falsetto', 'falsetstem', 'hoofdstem', 'falsetto register', 'trompetten', 'fanfare', 'ruches en bloeit', 'fantasie', 'fantasia', 'fermate', "point d'orgue", 'fermata', 'viool', 'vedel', 'fiddle', 'violen', 'fiedel', 'elektrische viool', 'prutsen', 'fiddlers', 'violist', 'vedelaar', 'speelman', 'fluit', 'blokfluit', 'bekfluit', 'fipple fluit', 'verticale fluit', 'fipple pijp', 'geschuifel', 'hushing', 'sissend', 'flamenco', 'flamenco muziek', 'flamenco dansen', 'mol', 'bemol', '♭', 'fluitist', 'fluitiste', 'lijst van fluitisten', 'bugel', 'flügelhorn', 'flugelhorn', 'flügelhoorn', 'flugelhoorn', 'bugelist', 'fluegelhorn', 'bugle', 'flugelhornist', 'fluglehorn', 'folk ballad', 'folksong', 'fortissimo', 'forte', 'piano', 'pianoforte', 'pianino', 'klavierinstrument', 'tingeltangel', 'mechaniek', 'hamer', 'pianomechaniek', 'piano forte', 'pianobouwer', 'akoestische piano', 'forte-piano', 'baby grand piano', 'fortepiano', 'grand piano', 'fortepianist', 'klassieke piano', 'fuga', 'fughetta', 'fugato', 'fugatische', "fuga's", 'dubbele fuga', 'funk', 'funky', 'funk muziek', 'solsleutel', 'vioolsleutel', 'g-sleutel', 'gambist', 'gamelan', 'gamelanmuziek', 'beduk', 'balinese gamelan', 'karawitan', 'pallet', 'chromatische', 'diatonische', 'gapped schaal', 'garboil', 'tumultuousness', 'gavotte', 'muziekgenre', 'muzikale stijl', 'lijst van muziekstijlen', 'muziekstijl', 'muziekstroming', 'fusie genre', 'muziek genre', 'genre', 'muzikale genre', 'muziek stijl', 'muziekgenres', 'gestalt', 'schnabbel', 'gigue', 'jigg', 'ierse jig', 'jig', 'jigs', 'glee club', 'zangvereniging', 'glissando', 'glissandi', 'glockenspiel', 'klokkenspel', 'beiaard', 'orkest klokken', 'orkestrale klokken', 'elektronische glockenspiel', 'oudje', 'gouwe ouwe', 'gospel', 'gospelmuziek', 'gospelkoor', 'gospel zangeres', 'gospel lied', 'gospel muziek', 'evangelie zingen', 'graduale', 'graduale romanum', 'grand opera', 'schuren', 'raspen', 'gregoriaanse gezangen', 'gregoriaans', 'gregoriaanse muziek', 'gregoriaanse zang', 'malen', 'vermalen', 'slijpen', 'knarsen', 'grond bas', 'groupie', 'gerommel', 'geknor', 'gemekker', 'straatgevecht', 'rommeling', 'rumble', 'oink', 'Guarnerius', 'gitaar', 'gitaren', 'gitaar modellen', 'gitaarmerk', 'slaggitaar', 'guitaar', 'rock gitaar', 'plectrum', 'gitarist', 'gitaarspeler', 'gitariste', 'gitaarvirtuoos', 'gitaristen', 'rock gitarist', 'habanera', 'half rust', 'hallelujah', 'stok', 'mallet', 'drumstok', 'trommelstok', 'percussie hamer', 'oscar hammerstein ii', 'hammerstein', 'oscar hammerstein', 'lionel hampton', 'hampton', 'Hare Krishna', 'boventoon', 'harmonische', 'harmonisatie', 'harmonium', 'reed organ', 'traporgel', 'huisorgel', 'kamerorgel', 'harmonieleer', 'harmony', 'harmonieën', 'harmonisch', 'muzikale harmonie', 'harp', 'harpist', 'harpen', 'harpspeler', 'harpiste', 'harpenist', 'klavecinist', 'klavecimbelspeler', 'clavecinist', 'hobo', 'hautbois', "hobo's", 'barokhobo', 'steel gitaar', 'steel guitar', 'lap steel', 'hawaiian gitaar', 'steelgitaar', 'pedal steel guitar', 'lap steelguitar', 'pedalsteelgitaar', 'hawaigitaar', 'slide guitar', 'pedal steel', 'hawaïgitaar', 'pedal steelguitar', 'pedal-steelgitaar', 'steel-gitaar', 'slide gitaar', 'slide-gitaar', 'lap steel guitar', 'lap steel gitaar', 'lapsteel', 'steelguitar', 'pedalsteel', 'dobro-gitaar', 'lap-steelgitaar', 'lapsteelgitaar', 'lap slide gitaar', 'hoofd register', 'heavy metal', 'metal', 'heavymetal', 'classic metal', 'metalmuziek', 'heavy metal muziek', 'heavy-metalband', 'heavymetalband', 'metal band', 'heavy metal band', 'metal rock', 'metal muziek', 'high-fidelity geluid systeem', 'highland fling', 'old-time music', 'old time music', 'old-time', 'hillbilly muziek', 'old-familiar tunes', 'oldtime', 'old-time singing', 'songs from dixie', 'old time', 'old-time muziek', 'oude tijd muziek', 'hiphop', 'hip-hop', 'rap', 'hip hop', 'hip hop muziek', 'hip-hop muziek', 'rap muziek', 'hiphopper', 'hip hop music', 'hip hop groep', 'hip hop artiest', 'rapgroep', 'homofonie', 'homofone', 'hoornist', 'hornpipe', 'hosanna', 'hossanna', 'hot jazz', 'gehuil', 'gejank', 'neuriën', 'neurien', 'gezoem', 'gebrom', 'bocca chiusa', 'neuriër', 'alambiek', 'analyse', 'stilte', 'hymnody', 'psalmodie', 'psalmgezang', 'thema', 'onderwerp', 'indruk', 'figuur', 'muzikaal thema', 'melodisch thema', 'pastorale', 'Impromptu', 'toneelmuziek', 'incidentele muziek', 'instrumentale muziek', 'instrumentaal', 'instrumentale', 'instrumentals', 'musicus', 'instrumentalist', 'speler', 'muzikante', 'muzikanten', 'bespeler', 'musicienne', 'muziekbeoefenaar', 'instrumentist', 'muziekartiest', 'muziekant', 'instrumentalisten', 'muzikale carrière', 'artiesten', 'muziek kunstenaar', 'instrumentatie', 'orkestraties', 'orkestratie', 'georkestreerd', 'intermezzo', 'tussenspel', 'Intermezzo', 'intonatie', 'intro', 'introïtus', 'introit', 'intredezang', 'introitus', 'omkering', 'inversie', 'inverteerbaar contrapunt', 'ipod', 'jamsessie', 'jam-session', 'jam session', 'jammen', 'jamsessies', 'janglepop', 'jazz', 'soul jazz', 'jazzmusicus', 'jazzmuziek', 'jazzmuzikant', 'jazzy', 'modern jazz', 'jazz muziek', 'jazzballet', 'jazzdance', 'jazzdans', 'jazz-ballet', 'jazzman', 'mondharp', 'muzikale boog', "joden 'harp", 'kaak harp', 'mond boog', 'swing', 'swing muziek', 'nonsens', 'swing band', 'swing jazz', 'jive', 'juke joint', 'jukejoint', 'getto huis', 'jook huis', 'jook gezamenlijke', 'juke huis', 'jug band', 'jugband', 'kruik bands', 'karaoke', 'karaoke-machine', 'karaoke box', 'noraebang', 'kazoo', 'gonzofoon', 'papierofoon', 'kazoe', 'kazoos', 'pauken', 'pauk', 'tympani', 'ketel trommel', 'tonaliteit', 'tonale muziek', 'toonsoort', 'tonaal', 'key music', 'toonaard', 'toetsinstrument', 'keyboard', 'toetsen', 'toetsinstrumenten', 'toetsenbord', 'keyboards', 'toetsenist', 'toetsenisten', 'knell', 'doodsklok', 'koto', 'koto-speler', 'kwela', 'langspeelplaat', 'l.p.', 'picture lp', 'elpee', '33 toeren', 'lp', 'lp record', 'witte plaat', 'longplay', 'lp album', 'lange spelen', 'l-p', 'kuttepiel', 'lagerphone', 'rinkelbom', 'ländler', 'larghetto', 'grave', 'largo', 'leadsheet', 'plaatlood', 'lead sheet', 'bladlood', 'ledger line', 'hulplijnen', 'zetlijn', 'grootboek lijn', 'leitmotiv', 'leidmotief', 'leitmotif', 'gefuhlsmoment', 'gefühlsmoment', 'rode draad', 'leidmotieven', 'leit motief', 'libretto', 'operatekst', 'librettist', 'libretti', 'kunstlied', 'cultuurlied', 'liederen', 'liedzanger', 'operette', 'opéra bouffe', 'opera-bouffe', 'opéra-bouffe', "jehovah's getuige", 'operettes', 'shuffle', 'zwaaide noot', 'litanie', 'lovesong', 'love song', 'liefdeslied', 'liefdesliedjes', 'luitspeler', 'luitist', 'lutist', 'lier', 'Liră', 'lyra', 'lieren', 'songfulness', 'lyricality', 'macumba', 'madrigaal', 'Madrigal', 'madrigalist', 'majeur', 'grote tertstoonladder', 'grote-tertstoonladder', 'grote-tertstoonsoort', 'grote schaal', 'durtoonladder', 'grotetertstoonladder', 'belangrijke diatonische schaal', 'mambo', 'haïtidans', 'mandola', 'maracas', 'sambaballen', 'sambabal', 'maraca', 'mars', 'marsmuziek', 'marcia', 'marslied', 'marching band', 'showband', 'dweilorkest', 'showkorps', 'marching bands', 'mariachi', 'mariachi band', 'xylofoon', 'marimba', 'xylofonist', 'soort xylofoon', 'gyil', 'xylofoons', "marimba's", 'marseillaise', 'volkslied van frankrijk', 'la marseillaise', 'staf', 'stafmuziek', 'militaire mars', 'martial muziek', 'mis', 'eucharistieviering', 'mazurka', 'pianola', 'speler piano', 'reproduceren piano', 'mechanische piano', 'player piano', 'potpourri', 'medley', 'rapsodie', 'mengelmoes', 'mengeling', 'tunefulness', 'melodiek', 'tonale patroon', 'meno mosso', 'metalhead', 'meter', 'eenvoudige tijd', 'polymeter', 'verbinding meter', 'dubbel', 'verbinding tijd', 'metronoom', 'metronoomaanduiding', 'Metronom', 'mezzosopraan', 'mezzo-sopraan', 'mezzo-sopranen', 'mineur', 'kleine tertstoonladder', 'kleine-tertstoonsoort', 'harmonisch mineur', 'kleine-tertstoonladder', 'moltoonschaal', 'kleine diatonische schaal', 'kleine schaal', 'mineur toonladder', 'melodisch mineur', 'natuurlijke mineur toonladder', 'harmonische mineur toonladder', 'melodische mineur toonladder', 'minneliederen', 'menuet', 'menuetto', 'menuetten', 'neo jazz', 'nieuwe jazz', 'moderne jazz', 'nu-jazz', 'electro-jazz', 'nu jazz', 'modulatie', 'monofonie', 'monodie', 'monofoon', 'monofone', 'monofone muziek', 'solozang', 'eenstemmigheid', 'monodische', 'moonwalk', 'moon-walk', 'morceau', 'motet', 'motetten', 'motief', 'motivatie', 'muzikaal motief', 'muzikaal idee', 'beweging', 'musette pijp', 'toonkunst', 'bladmuziek', 'muziekdoos', 'speeldoos', 'muziekspeeldoos', 'speelklok', 'muziekcriticus', 'muziek kritiek', 'muziekstandaard', 'lessenaar', 'muzieklessenaar', 'notenstandaard', 'muziekstatief', 'stoelendans', 'muziekdrama', 'muziekgezelschap', 'muzikale groep', 'muziekensemble', 'muzikale organisatie', 'muzieknotatie', 'notenschrift', 'muziekschrift', 'noot', 'muzieknoot', 'muzieknoten', 'toon', 'muzikale noot', 'passage', 'muziekpassage', 'muziek cognitie', 'muziek psychologie', 'muzikale perceptie', 'muzikale uitvoering', 'frase', 'muzikale zin', 'muzikale frasering', 'zin', 'toonladders', 'partituur', 'sound-track', 'soundtrack', 'filmmuziek', 'score', 'muzikale score', 'maatsoort', 'samengestelde maatsoort', 'vierkwartsmaat', '4/4 beat', 'muzikale maatsoort', 'maatsoorten', '2/4 maat', '4/4 maat', '6/8 maat', 'wals tijd', '4/4', '2/4 tijd', '12/8', 'muzikaliteit', 'demper', 'sordina', 'sourdine', 'plunjer mute', 'harmon mute', 'mute', 'gedempte trompet', 'neusgeluid', 'lijflied', 'nationale lied', 'negro-spiritual', 'negrospiritual', 'negro spirituals', 'negro spiritual', 'spiritual', 'spirituals', 'geestelijk', 'nocturne', 'nocturnes', 'notturno', 'ruisgenerator', 'obbligato', 'obligaat', "oboe d'amore", "hobo d'amore", 'liefdeshobo', 'hobo da caccia', 'hoboïst', 'octet', 'oktet', 'opmaat', 'vrolijk', 'offbeat', 'vrolijke', 'upbeat', 'opera', "opera's", 'barokopera', 'opera ster', 'operaster', 'orkest', 'orkesten', 'orkestra', 'orkestbak', 'muziekvereniging', 'symfonisch orkest', 'orkestmuziek', 'symfonieorkesten', 'symphony orchestra', 'chamber orchestra', 'orkestwerk', 'filharmonisch orkest', 'orkestrale', 'orchestratie', 'pijporgel', 'kerkorgel', 'het orgel', 'concertorgel', 'pijporgels', 'organist', 'orgelist', 'orgelspeler', 'concertorganist', 'ostinato', 'ostinate bas', 'basso ostinato', 'vamp', 'gitaar riff', 'riffs', 'staande ovatie', 'ovatie', 'ouverture', 'concert ouverture', 'tempi', 'vitement', 'presto gemarkeerd', 'prestissimo', "tempo's", 'ritardando', 'presto', 'virginaal', 'muzelaar', 'muselaar', 'maagdelijk', 'maagdelijke', 'paar virginalen', 'panfluit', 'syrinx', 'pandean pijp', 'pan pijpen', 'pan pijp', 'puf', 'stem', 'meerstemmig zingen', 'deel muziek', 'partita', 'variatie', 'partsong', 'meerstemmig stuk', 'paso doble', 'paso dobles', 'pasodoble', 'pavane', 'payola', 'omkoperij', 'orgelpunt', 'tin whistle', 'tinwhistle', 'pennywhistle', 'tin-whistle', 'penny whistle', 'ierse fluit', 'pentatonische toonladder', 'pentatoniek', 'vijftoonsysteem', 'pentatonische ladders', 'pentatonisch', 'pentatonische', 'pentatone', 'ritmesectie', 'slagwerk', 'drums', 'percussie', 'extra percussie', 'percussionist', 'symfonieorkest', 'filharmonisch', 'symfonie in d minor', 'fonograaf', 'phonograph', 'gramaphone', 'fonografen', 'toonarm', 'draaitafels', 'pianissimo', 'pianist', 'pianiste', 'pianospeler', 'jazzpianist', 'pianospeelster', 'pianisten', 'concertpianist', 'klassiek pianist', 'klassieke pianist', 'pianoles', 'pianomuziek', 'pianosonate', 'pianosonates', 'piano sonate', 'fluier', 'zwegel', 'pijp', 'eerste doedelzakspeler', 'pipe major', 'stemfluit', 'pitch pipe', 'pizzicato', 'plonzen', 'afspeellijst', 'playlist', 'afspeellijsten', 'speellijst', 'afspelen', 'spel', 'spelen', 'plof', 'mollig', 'polka', "polka's", 'polka muziek', 'polytonaliteit', 'pluritonaliteit', 'multitonaliteit', 'bitonaliteit', 'polytonalism', 'polytonale', 'bitonality', 'popmuziek', 'pop', 'populaire muziek', 'popmuzikant', 'popartiest', 'geschiedenis van de popmuziek', 'popzanger', 'popmuzikanten', 'popsong', 'popgroep', 'lichte muziek', 'populair lied', 'populaire muziek genre', 'populaire liedjes', 'popularism', 'naspel', 'prelude', 'praeludium', 'voorspel', 'introductie', 'entree', 'preambule', 'preludium', 'intrada', 'voorbereiding', 'primo', 'processie-', 'prosodion', 'recessie maart', 'processie maart', 'programma muziek', 'psalmist', 'punk beweging', 'punk subcultuur', 'punkrocker', 'punk cultuur', 'punk', 'punk rocker', 'punk scene', 'punk rock', 'punkrock', 'punkmuziek', 'punkband', 'punk-rock', 'punk muziek', 'punk revival', 'punk rock band', 'zuivere toon', 'muzikale toon', 'quadrophonic', 'quadraphony', 'quadrafonische geluid', 'quadrafonische', 'quadrafonische systeem', 'quadriphonic systeem', 'quadrille', 'quadrilles', 'timbre', 'klankkleur', 'timbrale', 'timbres', 'kwartrust', 'kwartet', 'viertal', 'jazz kwartet', 'kwartetten', 'vocaal kwartet', 'quickstep', 'rust', 'antigeluid', 'kwintet', 'vijftal', 'rhythm and blues', 'rhythm-and-blues', 'rhythm & blues', 'rnb', 'race music', 'rhythm en blues', "r'n'b", 'r & b', 'r’n’b', 'r&b', 'r  b', 'r  b muziek', 'r en b', 'rhythm  blues', 'ragtime', 'rag', 'ragtime muziek', 'gesyncopeerde maat', 'gerammel', 'gereutel', 'rale', 'ratelende', 'rapper', 'flow', 'proto-rap', 'stroom', 'emceeing', 'rappen', 'rappers', 'geklop', 'rat-a-tat-tat', 'rave', 'happy rave', 'early rave', 'rave muziek', 'realisatie', 'herschikking', 'herstructurering', 'recapitulatie', 'reprise', 'recital', 'pianorecital', 'overwegingen', 'recitals', 'overweging', 'recitatief', 'recitatieven', 'platenmaatschappij', 'grote platenmaatschappijen', 'major label', 'muziek label', 'grote platenmaatschappij', 'platenlabel', 'sublabel', 'platenmaatschappijen', 'hoes', 'platenhoes', 'cd-hoes', 'albumhoes', 'cd-hoesje', 'cassettedoosje', 'album artwork', 'record sleeve', 'album cover', 'album covers', 'album art', 'opnemen deksel', 'albumhoezen', 'blokfluitist', 'opnamestudio', 'muziekstudio', 'geluidsstudio', 'studio', 'geluidsopnamestudio', "opnamestudio's", 'radiostudio', 'opnamesysteem', 'riet sectie', 'spoel', 'reel', 'haspel', 'schotse haspel', 'reggae', 'reggea', 'raggae', 'reggae muziek', 'register', 'reharmonisation', 'reharmonization', 'release', 'uitgave', 'publicatie', 'muziek release', 'religieus lied', 'vermenigvuldiging', 'rapport', 'reproducent', 'Requiem', 'resolutie', 'resonantie', 'kalmte', 'rustteken', 'rumba', 'rhythm and blues muzikant', 'riff', 'rock n roll', 'rock', "rock-'n-roll", 'rockmuziek', 'rockmuzikant', 'rock and roll', 'rock-and-roll', 'rock muziek', "rock'n'roll", 'gitaarrock', 'rock-n-roll', "rock 'n' roll", 'rock  roll', "rock 'n' roll muzikant", 'rockband', 'rockgroep', 'ploeg', 'rock band', 'rockconcert', 'rock opera', 'rockopera', 'rockmusical', 'rock musical', 'metal opera', "rock opera's", 'rock star', 'rockabilly', 'rockabilly muziek', 'rondo', 'rondeau', 'rondeel', 'rondelen', 'rondovorm', 'roulade', 'round', 'troll', 'ronde', 'kort liedje met een refrein', 'aandeel in de opbrengst', 'billijke vergoeding', 'billijke vergoedingen', "royalty's", "betaling van royalty's", 'royalty betaling', 'rubato', 'tempo rubato', 'gesuis', 'geruis', 'ritseling', 'suizing', 'geritsel', 'ritselen', 'baroktrombone', 'samba', 'samba muziek', 'pagode', 'shamisen', 'samisen', 'bachi', 'sarabande', 'saxofonist', 'saxofoonspeler', 'saxofoonspeelster', 'saxist', 'scat', 'scat zingen', 'scatten', 'wegrennen', 'scène', 'toneel', 'scherzo', 'badinerie', 'schottische', 'schottisch', 'gekras', 'Scratch', 'kattengejank', 'kras', 'kattegejank', 'krassen', 'krabben', 'scream', 'schreeuw', 'schreeuwen', 'knerpen', 'secondo', 'sectie', 'dal segno', 'segno', 'septet', 'sequens', 'volgorde', 'serialisme', 'seriële muziek', 'seriele muziek', 'seriële compositie', 'sextet', 'sforzando', 'triller', 'kruis', '♯', 'scherp', 'schalmei', 'herdersfluit', 'snerpend', 'stridency', 'stridence', 'snarentrom', 'snare drum', 'kleine trom', 'paradetrom', 'snaardrum', 'snare trom', 'snaartrom', 'snare', 'snare trommel', 'snaredrum', 'snaretrommel', 'side drum', 'snarentrommel', 'snare drums', 'titelmuziek', 'herkenningsmelodie', 'kenwijsje', 'themalied', 'titelsong', 'titellied', 'theme tune', 'thema muziek', 'theme songs', 'singalong', 'meezingen', 'sing-a-long', 'zingt', 'sing-along', 'zanger', 'zangeres', 'zang', 'zangkunst', 'vocals', 'vrouwelijke zang', 'cleane zang', 'zangers', 'vocalisten', 'harmonie zang', 'vocalizing', 'zangstem', 'voice classificatie', 'sitarspeler', 'sissen', 'skank', 'skiffle', 'skiffle group', 'moshen', 'moshpit', 'moshpitten', 'wall of death', 'slam dansen', 'mosh', 'mosh pit', 'slam dance', 'moshing', 'slam dans', 'schleifer', 'knip', 'solfa', 'tonic solfa', 'notenleer', 'solfège', 'solfege', 'solmisatie', 'solmisation', 'solmization', 'solo', 'obligaatstem', 'solopartij', 'solist', 'obligatist', 'solozanger', 'sonate', 'sonata', 'sonates', 'sonatevorm', 'hoofdvorm', 'doorwerking', 'sonate-allegro vorm', 'sonatine', 'sonatina', 'liedje', 'een appel en een ei', 'nummer', 'song', 'liedjes', 'sopraan', 'sopraanzanger', 'sopranist', 'sopraanzangeres', 'mannensopraan', 'sopraanstem', 'sopraansleutel', 'soul', 'soul music', 'soulmuziek', 'soul muziek', 'geluidseffect', 'geluidseffecten', 'geluidsweergave', 'gesputter', 'sputteren', 'sprechgesang', 'sprechstimme', 'zingzeggen', 'square-dance muziek', 'kreet', 'zuigen', 'notenbalk', 'balk', 'vers', 'strofe', 'notenbalknotatie', 'stalen band', 'stalen pan', 'steelband', 'stalen vaten', 'steelpan', 'stereo', 'stereo-installatie', 'hifiinstallatie', 'hifi-installatie', 'installatie', 'hi-fi-installatie', 'geluidsinstallatie', 'stereophonic systeem', 'stereofonie', 'stereotoren', 'stereo geluid', 'stereogeluid', 'strad', 'stradavarius', 'strijkorkest', 'strijkersenemble', 'strijkkwartet', 'strijkkwartetten', 'snaar quartette', 'strings', 'strijkers', 'koordregeling', 'strijkinstrumenten', 'snaren', 'studie', 'voorstudie', 'pick-upnaald', 'grammofoonnaald', 'naald', 'stylus', 'suite', 'suites', 'orkestrale suite', 'boventiteling', 'surtitle', 'supertitle', 'symfonie', 'symfonieën', 'symfonische muziek', 'symphonie', 'symfonieen', 'sinfonia concertante', 'kamersymfonie', 'symfonische', 'symfonisch gedicht', 'toon gedicht', 'symfonicus', 'syncopatie', 'syncope', 'syncoop', 'syncopen', 'gesyncopeerde', 'syncopator', 'synthesizer', 'synthesizers', 'synthesizer reparatie', 'synth pad', 'arpeggiator', 'toetsenbord synthesizer', 'bas synthesizer', 'lint controller', 'synth bass', 'adsr envelope', 'audio-synthese', 'envelope generator', 'synths', 'patch', 'synth', 'muziek synthesizer', 'geluid synthese', "ta'ziyeh", 'tabulatuur', 'tablatuur', 'greepschrift', 'tab', 'tamboerijn', 'beltrom', 'handtrom met schellen', 'buben', 'tamboerijnen', 'ballroomtango', 'ballroom tango', 'tango', 'geluidscassette', 'cassetteband', 'audiocassette', 'cassettebandje', 'bandopname', 'taping', 'bandrecorder', 'bandopnemer', 'taperecorder', 'magnetofoon', 'tape-recorder', 'bandopnameapparaat', 'audio-tape', 'tape machine', 'bandrecorders', 'magneetband geluidsopname', 'tikken', 'tapping', 'getik', 'tarantella', 'pizzica tarantella', 'pizzica tarantata', 'tarantelle', 'techno', 'experimentele techno', 'techno muziek', 'tenor', 'heldentenor', 'tenor buffo', 'tenore di forza', 'tenorstem', 'tenoren', 'dramatische teneur', 'lyrische tenor', 'tenorsleutel', 'tenorsaxofoon', 'tenorsaxofonist', 'tenorsax', 'tenor-saxofoon', 'tenorist', 'textuur', 'muzikale textuur', 'theme song', 'theremin', 'paukenist', 'paukeslager', 'toccata', 'fakkel zanger', 'torch song', 'fakkel songs', 'tra-la', 'tra-la-la', 'trad', 'tremolo', 'tremulant', 'triangel', 'triangelist', 'driehoek', 'trio', 'in drieën', 'trombonist', 'trompetsectie', 'twist', 'the twist', 'ukelele', 'ukulele', 'ukalile', 'uke', 'con variazione', 'con variazioni', 'variaties', 'variant', 'thema en variaties', 'variatie vorm', 'vibrafonist', 'vibist', 'vibrato', 'victrola', 'altviool', 'viola', 'viola da braccia', 'bratch', 'altviolist', 'bratsche', 'altviolen', "viola d'amore", 'viola-damore', 'viola da braccio', 'viool sectie', 'altvioliste', 'virtuoos', 'meester', 'virtuositeit', 'vocale muziek', 'zangmuziek', 'zangpartij', 'voice part', 'vrijwillige', 'walkman', 'walkman®', 'muziekmaat', 'sony walkman', 'wals', 'bruidsmars', 'trouwmars', 'bruiloftsmars', 'huwelijksmars', 'wedding march', 'bruiloft mars', 'bruiloft muziek', 'gefluit', 'fluiten', 'hele rust', 'draad-recorder', 'wire recorder', 'werk lied', 'werkliederen', 'xylophonist', 'jodelen', 'jodelende', 'yodeler', 'jodelaar', 'yodeller', 'zill', 'zydeco', 'zydeco muziek', 'begeleiden', 'slaan', 'maatslaan', 'wegblazen', 'rammelen', 'klaroen', 'balein', 'reciteren', 'akkoorden spelen', 'harmoniseren', 'ronken', 'rinkelen', 'toonzetten', 'contrapunteren', 'knappen', 'discant zingen', 'DJ', 'dalen', 'drummen', 'fiedelen', 'vioolspelen', 'neerzakken', 'neervallen', 'neerzinken', 'neerploffen', 'grommelen', 'dreunen', 'grommen', 'daveren', 'denderen', 'harp spelen', 'brommen', 'verstillen', 'een hymne zingen', 'instrumenteren', 'omkeren', 'misleiden', 'blaasjes wijsmaken', 'stemmen', 'madrigalen zingen', 'geluid maken', 'op melodie zetten', 'een fout maken', 'orkestreren', 'blazen', 'musiceren', 'opzetten', 'manipuleren', 'bespelen', 'ploppen', 'preluderen', 'voorbereiden', 'kwinkeleren', 'kabaal maken', 'realiseren', 'reharmoniseren', 'herhalen', 'riffen', 'walsen', 'in partituur brengen', 'op muziek zetten', 'verhogen', 'van blad zingen', 'voorzingen', 'uitzingen', 'snerpen', 'klotsen', 'binden', 'soleren', 'swingen', 'samenstemmen', 'syncoperen', 'opnemen', 'transcriberen', 'transponeren', 'a capella', 'begeleid', 'antifonaal', 'Beethoviaans', 'cantabile', 'zangerig', 'reciterend', 'koor-', 'vuil', 'vies', 'smerig', 'besmeurd', 'vervuilde', 'vuile', 'welluidend', 'schoonklinkend', 'eerste', 'verlaagd', 'homofoon', 'gestemd', 'larghissimo', 'lentissimo', 'lento', 'swingend', 'lyrisch', 'groot', 'mensuraal', 'melodieus', 'klein', 'monodisch', 'muzikale', 'ongealtereerd', 'geluidloos', 'pianistisch', 'zacht', 'toonhebbend', 'meerstemmig', 'polytonaal', 'stil', 'geruisloos', 'rustig', 'vredig', 'luidruchtig', 'rietachtig', 'tweede', 'hoog', 'verhoogd', 'zingbaar', 'langzaam', 'zachtvoetig', 'solistisch', 'tonicagerelateerd', 'onbegeleid', 'onmelodieus', 'wagneriaans', 'accelerando', 'korisch', 'legato', 'schril', 'staccato'];


function changeModule(value) {
    const $select = document.querySelector('#module');
    var select_id = "option_module-" + $select.value;
    $("#"+select_id).show();
    $select.value = value;
    $("#module_dropdown").hide();
    $("#module").removeClass( "module_active");
    $('.option_module').removeClass( "option_module_last");
    $('.active-stats-module').html($select.value);
    if (!['Wikipedia', 'Periodicals', 'Books'].includes($select.value)) {

        if ($select.value == "Pilots-Bells") {
        const $lang = document.querySelector('#lang');
        $lang.value = "IT";
        $("#lang").attr("disabled", true);
        autocomplete(document.getElementById("lemma"), lexiconIT);

        } else if ($select.value == "Pilots-Organs") {
        const $lang = document.querySelector('#lang');
        $lang.value = "NL";
        $("#lang").attr("disabled", true);
        autocomplete(document.getElementById("lemma"), lexiconNL);

        } else {
        const $lang = document.querySelector('#lang');
        $lang.value = "EN";
        $("#lang").attr("disabled", true);
        autocomplete(document.getElementById("lemma"), lexiconEN);
        };

        document.getElementById("lang_dropdown").style.display="none";
        $("#lang").removeClass( "lang_active");
        $('#lang').blur();
        dropdown_dwn_lang = 1;
        $('#stat-entities-icon').hide();
        $('#stat-entities').hide();
    } else {
        if ($select.value == "Wikipedia") {
        $('#stat-entities-icon').show();
        $('#stat-entities').show();
        } else {
        $('#stat-entities-icon').hide();
        $('#stat-entities').hide();
        }
        const $lang = document.querySelector('#lang');
        $lang.value = "EN";
        autocomplete(document.getElementById("lemma"), lexiconEN);
        $("#lang").attr("disabled", false);
        dropdown_dwn_lang = 1;
        $('#lang').blur();

    };
    var reg = /\-/;
    var strippedtext = $select.value.replace(reg, "");
    changeStats(eval("stats" + strippedtext));
    dropdown_dwn_module = 1;
}

function pilotsDropdown() {
    $(".option_module_other").hide();
    $(".option_module_pilot").show();
    $('.option_module').removeClass( "option_module_last");
    var last_option = $('.option_module:visible:last');
    last_option.addClass( "option_module_last");

}

function pilotsBack() {
    $(".option_module_other").show();
    $(".option_module_pilot").hide();
    var last_option = $('.option_module:visible:last');
    last_option.addClass( "option_module_last");
    const $select = document.querySelector('#module');
    var select_id = "option_module-" + $select.value;
    $("#"+select_id).hide();
}

// Change select options (lang)

var dropdown_dwn_lang = 1;

function dropDownLang(){
    if(dropdown_dwn_lang == 0){
        document.getElementById("lang_dropdown").style.display="none";
        $("#lang").removeClass( "lang_active");
        $('#lang').blur();
        $('.option_lang').removeClass( "option_lang_last");
        dropdown_dwn_lang = 1;
    }else{
        document.getElementById("lang_dropdown").style.display="block";
        const $select = document.querySelector('#lang');
        var select_id = "option_lang-" + $select.value;
        $("#"+select_id).hide();
        $("#lang").addClass( "lang_active");
        $('#lang').blur();
        var last_option = $('.option_lang:visible:last');
        last_option.addClass( "option_lang_last");
        dropdown_dwn_lang = 0;
    }
};


/*initiate the autocomplete function on the "myInput" element, and pass along the lexicon-en array as possible autocomplete values:*/
var lexiconList = lexiconEN;
window.onload = function() {
  animateCount();
  autocomplete(document.getElementById("lemma"), lexiconList);
};

function changeLang(value) {
    const $select = document.querySelector('#lang');
    var select_id = "option_lang-" + $select.value;
    $("#"+select_id).show();
    $select.value = value;
    $("#lang_dropdown").hide();
    $("#lang").removeClass( "lang_active");
    $('.option_lang').removeClass( "option_lang_last");
    dropdown_dwn_lang = 1;
    // change autocomplete
    lexiconList = eval("lexicon" + $select.value);
    autocomplete(document.getElementById("lemma"), lexiconList);
}

// Add or remove number

function addOne() {
    var num = +$("#number").val() + 1;
    $("#number").val(num);
}

function removeOne() {
    var num = +$("#number").val() - 1;
    $("#number").val(num);
}
// Download test
function download_text(data){
    var a = document.body.appendChild(
        document.createElement("a")
    );
    name = currentLemma + currentType.charAt(0).toUpperCase() + currentType.slice(1) + "Search" + "(" + currentModule + "-" + currentLang + ")"
    a.download = name + ".text";
    collection_ids = document.getElementsByClassName("sent_id");
    collection_sents = document.getElementsByClassName("full_sentence");
    final_csv = "";
    currentCount = parseInt(currentNumb) + more_button_clicks
    for (let i = 0; i < currentCount; i++) {
        sentence = collection_ids[i].textContent.trim() + "\t" + collection_sents[i].textContent + "\n";
        final_csv+= sentence;
        };
    a.href = "data:text/html," + final_csv;
    a.click();
};

// Download test csv
function download_csv(){
    var a = document.body.appendChild(
        document.createElement("a")
    );
    name = currentLemma + currentType.charAt(0).toUpperCase() + currentType.slice(1) + "Search" + "(" + currentModule + "-" + currentLang + ")"
    a.download = name + ".csv";
    collection_number = document.getElementsByClassName("sent_pos");
    collection_ids = document.getElementsByClassName("sent_id");
    collection_left = document.getElementsByClassName("sent_left");
    collection_right = document.getElementsByClassName("sent_right");
    collection_keys = document.getElementsByClassName("sent_key");
    final_csv = "";
    currentCount = parseInt(currentNumb) + more_button_clicks
    for (let i = 0; i < currentCount; i++) {
        sentence = "sent_" + collection_number[i].textContent + "\t" + collection_ids[i].textContent.trim() + "\t" + collection_left[i].textContent.trim() + "\t" + collection_keys[i].textContent.trim() + "\t" + collection_right[i].textContent.trim() + "\n";
        final_csv+= sentence;
        };
    a.href = "data:text/html," + final_csv;
    a.click();
};

// Download selected csv
function download_selected(){
    var a = document.body.appendChild(
        document.createElement("a")
    );
    name = currentLemma + currentType.charAt(0).toUpperCase() + currentType.slice(1) + "Search" + "(" + currentModule + "-" + currentLang + ")";
    a.download = name + ".csv";
    final_csv = "";
    currentCount = checked_rows.length;
    for (let i = 0; i < currentCount; i++) {
        select = checked_rows[i];
        collection_number =  document.getElementById(select).getElementsByClassName("sent_pos")[0];
        collection_ids = document.getElementById(select).getElementsByClassName("sent_id")[0];
        collection_left = document.getElementById(select).getElementsByClassName("sent_left")[0];
        collection_right = document.getElementById(select).getElementsByClassName("sent_right")[0];
        collection_keys = document.getElementById(select).getElementsByClassName("sent_key")[0];
        sentence = "sent_" + collection_number.textContent + "\t" + collection_ids.textContent.trim() + "\t" + collection_left.textContent.trim() + "\t" + collection_keys.textContent.trim() + "\t" + collection_right.textContent.trim() + "\n";
        final_csv+= sentence;
        };
    a.href = "data:text/html," + final_csv;
    a.click();
};

// Download selected txt
function download_selected_txt(){
    var a = document.body.appendChild(
        document.createElement("a")
    );
    name = currentLemma + currentType.charAt(0).toUpperCase() + currentType.slice(1) + "Search" + "(" + currentModule + "-" + currentLang + ")";
    a.download = name + ".text";
    final_csv = "";
    currentCount = checked_rows.length;
    for (let i = 0; i < currentCount; i++) {
        select = checked_rows[i];
        collection_ids = document.getElementById(select).getElementsByClassName("sent_id")[0];
        var full_sent_id = checked_rows[i].replace("row","full_sentence");
        collection_sents = document.getElementById(full_sent_id);
       sentence =  collection_ids.textContent.trim() + "\t" + collection_sents.textContent + "\n";
       final_csv+= sentence;
        };
    a.href = "data:text/html," + final_csv;
    a.click();
};


// counter animation

function animateCount() {
$(".count").each(function () {
  $(this)
    .prop("Counter", 0)
    .animate(
      {
        Counter: $(this).text()
      },
      {
        duration: 1600,
        easing: "swing",
        step: function (now) {
          $(this).text(Math.ceil(now));
        }
      }
    );
});
}

window.onscroll = function() {scrollFunction()};
function scrollFunction() {
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    document.getElementById("header-logo").classList.add("header-logo-small");
    document.getElementById("header").classList.add("header-small");
  } else {
    document.getElementById("header-logo").classList.remove("header-logo-small");
    document.getElementById("header").classList.remove("header-small");
  }
}

// Menu

function openAbout () {

    document.getElementById("infobox").style.display = "none";
    document.getElementById("sticky_div").style.display = "none";
    document.getElementById("result").style.display = "none";
    document.getElementById("bottom-spacer").style.display = "none";
    document.getElementById("infobox_about").style.display = "block";
    document.getElementById("infobox_guide").style.display = "none";
    document.body.style.backgroundColor = "#f4edec";



}

function openGuide() {
    document.getElementById("infobox").style.display = "none";
    document.getElementById("sticky_div").style.display = "none";
    document.getElementById("result").style.display = "none";
    document.getElementById("bottom-spacer").style.display = "none";
    document.getElementById("infobox_guide").style.display = "block";
    document.getElementById("infobox_about").style.display = "none";
    document.body.style.backgroundColor = "#f4edec";
}

function openMain () {
    document.getElementById("infobox").style.display = "block";
    document.getElementById("sticky_div").style.display = "block";
    document.getElementById("bottom-spacer").style.display = "block";
    document.getElementById("infobox_about").style.display = "none";
    document.getElementById("infobox_guide").style.display = "none";
    document.getElementById("result").style.display = "block";
    document.body.style.backgroundColor = "#000000";

}

// Module toggle in about section

$(document).on("click", ".module-info-title", function(event){
    var opened = 0;
    if(event.target.classList.contains('module-info-title-active')) {
    $(event.target).removeClass('module-info-title-active');
    opened = 1;
    }
    $(".module-info-title").removeClass('module-info-title-active');
    $(event.target).removeClass('module-info-title-active');
    event.preventDefault();
    var next = $(this).closest('div').next('.module-info-box');
    next.slideToggle();
    if (opened == 0) {
    $(event.target).addClass('module-info-title-active');
    }
    $('.module-info-box:visible').not(next).slideToggle();


});

// Autocomplete

function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
          b.addEventListener("click", function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
          });
          a.appendChild(b);
        }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}

