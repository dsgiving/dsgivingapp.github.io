/*!
    * Start Bootstrap - Agency v6.0.0 (https://startbootstrap.com/template-overviews/agency)
    * Copyright 2013-2020 Start Bootstrap
    * Licensed under MIT (https://github.com/BlackrockDigital/startbootstrap-agency/blob/master/LICENSE)
    */
	// theme scripts
    (function ($) {
    "use strict"; // Start of use strict

    // Smooth scrolling using jQuery easing
    $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function () {
        if (
            location.pathname.replace(/^\//, "") ==
                this.pathname.replace(/^\//, "") &&
            location.hostname == this.hostname
        ) {
            var target = $(this.hash);
            target = target.length
                ? target
                : $("[name=" + this.hash.slice(1) + "]");
            if (target.length) {
                $("html, body").animate(
                    {
                        scrollTop: target.offset().top - 72,
                    },
                    1000,
                    "easeInOutExpo"
                );
                return false;
            }
        }
    });

    // Closes responsive menu when a scroll trigger link is clicked
    $(".js-scroll-trigger").click(function () {
        $(".navbar-collapse").collapse("hide");
    });

    // Activate scrollspy to add active class to navbar items on scroll
    $("body").scrollspy({
        target: "#mainNav",
        offset: 74,
    });

    // Collapse Navbar
    var navbarCollapse = function () {
        if ($("#mainNav").offset().top > 100) {
            $("#mainNav").addClass("navbar-shrink");
            $("#mainNav .img1").attr("src","assets/img/dslogo-green.png");
            $("#mainNav .btn").css("background","#98cfce");
        } else {
            $("#mainNav").removeClass("navbar-shrink");
            $("#mainNav .img1").attr("src","assets/img/dsLogo-black-500.png");
            $("#mainNav .btn").css("background","#444444");
        }
    };
    // Collapse now if page is not at top
    navbarCollapse();
    // Collapse the navbar when page is scrolled
    $(window).scroll(navbarCollapse);
})
(jQuery); // End of use strict

// DonorSearch script

var htmlToAdd=""; 	// to display search results
var showGifts=1;   	// sort and order options for search
var orderBy=1;		// sort and order options for search

//
// check visit count cookie
// if not found create new ds cookie for counter
// if found, increment  counter
//
var visit = getCookie("hsDS");
var superuser = getCookie("hsDS25");
var visit10 = getCookie("hsDS10");
var legacy = getCookie("hsDSL");

// code changed 6-8-20 to allow 10 searches before form displays 
// hsDSL will determine whether user has already filled out form. 
// (only set for new users) 
// prevents prior users from having to fill out form again.
// 
if (legacy == "" || visit == null) {
	legacy = "Y";
}else {
	legacy = "N";
}	
if (visit == "" || visit == null) {
	visit = 0;
	setCookie("hsDSL", 'N', 365);
	legacy = "N";
}


//
// show results on screenModal close (even if form not submitted)
//
$('#screenModal').on('hidden.bs.modal', function () {
  $("#myModal").modal("show");
});

// capture ga event when visitor clicks on get a demo, donorsearch.net or contact us 
var captureOutboundLink = function(url) {
 ga('send', 'event', 'outbound', 'click', url, {
 'transport': 'beacon',
 'hitCallback': function(){document.location = url;}
 });
} 


if($(location).attr("hash")!=""){
  $(location).attr("href","#/home");
  $("#searchbox").val("")
}

$("#searchbox").keypress(function (e) {
  if(e.which == 13){
    e.preventDefault();
      send();
  }
});


function resultsClose(){
  $("#resultsModal").empty();
  $("#resultsModal").html('<center><div class="loader" id="loader"><\/div><\/center>')
}

function clearForm(){
 $('#searchForm').trigger('reset');
}

function send(){
    $("#resultsModal").empty();
    $('.message').css('display','none');
    htmlToAdd="";
    var state=$("#state option:selected").val();
    var name=$("#searchbox").val();
    if(name.length<2){
        $('.message').html('Please enter a name or business');
        $('.message').css('display','block');
        return;
    }
    sendRequest(name,state,showGifts,orderBy);
    }
    function sendRequest(name,st,gifts,order){
		ga('send', 'pageview', '/?name='+name+'&state='+st);    
		//
		//	update hubspot hidden input fields with current search info
		//
		// push hubspot event to track name searched
		//
 		_hsq.push(["trackEvent",{
			id:"dsgiving_usage",
			value:visit
		}]); 
		visit++;
		setCookie("hsDS", visit, 365);
		//
		//  after 10 searches(required), visitor to fill out lead form (visit10 and hsDS10)
		//  after 20 searches,(optional) display screening form 
		//  after 50 searches, (required )visitor must fill out client feedback form or get a demo
		//
		if (visit > 9 && (visit10 == null || visit10 == "") && legacy == 'N'){
			$("#captureModal").modal("show");
			$("#myModal").modal("hide");
		}else if (visit == 20 ){
			$("#screenModal").modal("show");
			$("#myModal").modal("hide");
		}else if (visit >= 50 && (superuser == "" || superuser == null)){
			$("#limitModal").modal("show");
			$("#myModal").modal("hide");
		}else{				
			$("#captureModal").modal("hide");
			$("#myModal").modal("show");
		}
        startSpinner();
        var match="No";
        var nick="No";
        var c=$.ajax({
            url:"https://www.donorlead.net/app/search.php",
            dataType:"json",
            type:"POST",
            data:{search:name,Exact:match,NN:nick,state:st,showGifts:gifts,orderBy:order},
            jsonpCallback:"jcall",
            success:function(results){
                stopSpinner();
                if(results=="fail"){
					addToResults('<div class="alert alert-danger" role="alert">No Results Found.<\/div>');
					$("#resultsModal").html(htmlToAdd);
					return;
                }
                if(results.Count == null){
                    addToResults('<div class="alert alert-danger" role="alert">No Results Found.<\/div>');
                    $("#resultsModal").html(htmlToAdd);return false;
                }
				var showState = st;
                var i=results.Count.gifts+results.Count.fec;
                var j=results.Count.fecShowing+results.Count.giftsShowing;
				if (showState == 'ZZ'){
					showState = 'Any';
				}
                $('#myModalLabel').html(i+' results found for <strong>'+name+'('+showState+')'+'</strong>');
                $('#captureModalLabel').html(i+' results found for <strong>'+name+'('+showState+')'+'</strong>');
                if(results.bio && i > 0 ){
                    addToResults('<center><div class="alert alert-info" role="alert">'+results.bio+"<\/div><\/center>");
                }
                addToResults('<div class="alert alert-success" role="alert" id="counts">Showing '+j+" of "+i+" <\/div>");
                $.each(results.Data,function(k,l){
                    addToResults('<div class="heading"><div class=""><div class=""><div class="panel panel-default"><div class="panel-heading giftHeading"><div class="panel-title"><h3><center>'+l.Organization_Name+'('+l.State+")<\/center><\/h3><\/div><\/div>");
                    addToResults('<div class=""><div class="col-xs-12 col-sm-12 col-lg-12"><center><b>Gift Amount Range: <\/b><br/>'+l.lowgift_level+" - "+l.highgift_level+"<\/center><\/div><\/div><\/div><\/div>");
                    addToResults('<div class="row giftDetails"><div class="col-xs-4 col-sm-4 col-lg-4"><center><b>Gift Year<\/b><br/>'+l.Gift_Year+'<\/center><\/div><div class="col-xs-4 col-sm-4 col-lg-4"><center><b>Donor<\/b><br/>'+l.Donor_Name+'<\/center><\/div><div class="col-xs-4 col-sm-4 col-lg-4"><center><b>Gift Type<\/b><br/>'+l.Gift_Type+"<\/center><\/div><\/div>");
                    addToResults("<\/div><\/div><\/div>")
                });
                addToResults('<div class="row modalLinks"><div class="footerLinks"><div class="col-xs-12 col-sm-12 col-lg-12"><p style="padding: 10px;font-size: 22px;color:#333333;">Learn more about how DonorSearch can help with your prospecting needs.</p><center><a href="http://www.donorsearch.net/get-a-demo/" target="_blank" class="footerLinkModal">Request a Free Trial<\/a><br/><hr class="modalHR"><\/center><\/div><div class="col-xs-12 col-sm-12 col-lg-12"><center><a href="http://www.donorsearch.net" class="footerLinkModal">Visit us at DonorSearch.net<\/a><br/><hr class="modalHR"><\/center><\/div><div class="col-xs-12 col-sm-12 col-lg-12"><center><a href="http://www.donorsearch.net/contact/" class="footerLinkModal">Contact Us for More Information<\/a><\/center><\/div><\/div><\/div>');
                $("#resultsModal").html(htmlToAdd);
				$("#contactForm").trigger("reset");
				
            },
            error:function(){
                stopSpinner();
                addToResults('<div class="alert alert-danger" role="alert">No Results Found.<\/div>');$("#resultsModal").html(htmlToAdd);
            }
        })
}

function addToResults(a){
     htmlToAdd=htmlToAdd+a;
 }
function buildResultsHtml(a){}
function stopSpinner(){
  $("#loader").css("visibility","hidden");
}
function startSpinner(){
    $("#resultsModal").html('<center><div class="loader" id="loader"><\/div><\/center>');
    $("#loader").css("visibility","visible");
}
function sgSelect(a){
    $("#sg1, #sg2, #sg3").removeClass("btn-secondary");
    $(a).addClass("btn-secondary");
    showGifts=$(a).attr("value");
}
function typeSelect(a){
$("#type1, #type2").removeClass("btn-secondary");
    orderBy=$(a).attr("value");
    $(a).addClass("btn-secondary");
}
function nameInputTouched(){
    $("#searchbox").attr("placeholder","");
    $("#searchbox").val('');
    $("#searchbox").focus();
}
// DS cookie function to get/set counter
function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	// set expiration date to a year from now
	var expires = "expires="+d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i = 0; i < ca.length; i++) {
	var c = ca[i];
	while (c.charAt(0) == ' ') {
	  c = c.substring(1);
	}
	if (c.indexOf(name) == 0) {
	  return c.substring(name.length, c.length);
	}
	}
	return "";
}
function currentClient(){
	$("#limitModal").modal("hide");
	$("#clientModal").modal("show");
	
}
function getDemo(){
	$("#limitModal").modal("hide");
	$("#demoModal").modal("show");
}

