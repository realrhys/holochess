// Copyright (C) 2018, Damien Douté
// Based on The MetaCurrency Project (Eric Harris-Braun & Arthur Brock)
// Use of this source code is governed by GPLv3 found in the LICENSE file
//---------------------------------------------------------------------------------------

var Me             = null;
var g_handle       = null;
var g_handles      = {};
var g_users        = {};
var g_activeOpponent = null;

// Holochain UI library

// use send to make an ajax call to your exposed functions
function hc_send(fn, data, resultFn) 
{
  console.log("calling: " + fn + " with " + JSON.stringify(data));
  $.post(
      "/fn/Holochess/" + fn,
      data,
      function(response) 
      {
          console.log("\tresponse: " + response);
          resultFn(response);
      }
  ).fail(function(response)
   {
      console.log("\tresponse failed: " + response.responseText);
  })
  ;
};

//============================================================================


function getHandle(who, callbackFn)
{
  hc_send("getHandle",
          who, 
          function (handle)
          {
            if (callbackFn != undefined)
            {
                callbackFn(handle);
            }
          });
}

function getMyHandle() 
{
  getHandle(Me, function (handle)
  {
      Handle = handle;
      $("#handle").html(handle);
  });
}

function getProfile() 
{
  hc_send("getMyHash", undefined, function(me)
  {
      Me = me;
      getMyHandle();
      $("#playerid").html(me);
  });
}

function getHandles(callbackFn)
{
  hc_send("getHandles", 
          undefined, 
          function (json)
          {
              g_handles = JSON.parse(json);
              updateOpponentList();
              if (callbackFn != undefined)
              {
                  callbackFn(g_handles);
              }
          });
}


function updateOpponentList() 
{
  $("#players").empty();
  for (var x = 0; x < g_handles.length; x++) 
  {
      $("#players").append(makePlayerHtml(g_handles[x]));
  }
  if (g_activeOpponent) 
  {
      setActiveOpponent();
  }
}

function makePlayerHtml(handle_object) 
{
  console.log(handle_object);
  return  "<li data-id=\"" + handle_object.Hash + "\""
        + "data-name=\"" + handle_object.Entry + "\">"
        + handle_object.Entry
        + "</li>";
}

//============================================================================


function selectOpponent(event) 
{
  $("#players li").removeClass("selected-player");
  g_activeOpponent = $(this).data('id');
  setActiveOpponent();
}


function setActiveOpponent()
{
  var elem = $("#players li[data-id=" + g_activeOpponent + "]");
  $(elem).addClass("selected-player");
  $("#games-header").text("Games with " + $(elem).data("name"));
  // loadHistory();
}

// 
function commitChallenge() 
{
  if (!g_activeOpponent) 
  {
      alert("pick a player first!");
      return;
  }
  hc_send("commitChallenge", 
          JSON.stringify({ "opponent": g_activeOpponent, "challengerPlaysWhite": true, "isGamePublic": true }),  // FIXME
          function(result)
          {
              result = JSON.parse(result);
              console.log("Challenge Hashkey: " + result);
          }
        );  
}

//============================================================================

// Add behavior to HTML
$(window).ready(function () 
{
  // $("#handle").on("click", "", openSetHandle);
  // $('#setHandleButton').click(doSetHandle);
  $("#players").on("click", "li", selectOpponent);
  $("#challenge-button").click(commitChallenge);
  getProfile();
  setInterval(getHandles, 2000);
});