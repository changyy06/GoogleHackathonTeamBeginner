// Combined Project File
function emailNotifications() {
   var emailSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("EmailList");
    //retrieves sheet named "EmailList"

    var emailRange = emailSheet.getRange("A1:Z15");
    //specifies cell range in the sheet, from cell A1 to cell Z15 in this case

    var emailAddresses = emailRange.getValues().flat();
    //retrieves two-dimensional array of values from specified range (emailRange)
    //.flat() method converts two-dimensional array into single-dimensional array
    //.flat() method concantenates all nested arrays (rows) within the main array (columns) into a single array

    emailAddresses.forEach(function(email) {
    //.forEach(function(email) { ... }): This method iterates over each element (email) in the emailAddresses array and executes the function defined inside the parentheses for each element.

      if (email && email !== "") { //check if email exists and not an empty string
        var subject = "Calendar Event Notification";
        //subject line of email

        var message = "Dear user,\n\nYou have upcoming events in your calendar.";
        //message or text body of email

        var sheet = "https://docs.google.com/spreadsheets/d/1biEBgFrI4GgCe1tPsDjIj7xAJ5HNwZ8S-BPV6ijvmes/edit?usp=sharing";
        //allow the receiver to access the sheet

        MailApp.sendEmail(email, subject, message, sheet);
        //sends an email
      }
    });

}
\n
function myCal() {
  var ss = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  //retrieves sheet

  var calId = "eceb84e9b03980f923bf43472fea9f56d8a8773b1e7266f8a5d1632d2252bff6@group.calendar.google.com";
  //calendar id

  var cal = CalendarApp.getCalendarById(calId);
  //retrieves calendar
  
  var now = new Date();
  //current date and time

  var todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  //start of current day (midnight)

  var todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  //end of current day (1 second before the next day)

  var pastEvents = [];
  //events which happened before current day

  var todayEvents = [];
  //events which happened or going to happened on current day

  var futureEvents = [];
  //events which are going to happen after current day

  var events = cal.getEvents(new Date("2024-01-01T00:00:00"), new Date("2025-12-31T23:59:59"));
  //retrieve all events that are within range from 01/01/2024 to 31-12-2025
  
  for (var i = 0; i < events.length; i++) {
  //initialise i=0, and i+1 when value of i is smaller than length of events array
    
    var event = events[i];
    //events array

    var startTime = event.getStartTime();
    //retrieve start time of event

    if (startTime < todayStart) {
    //check if event's start time is before current day

      pastEvents.push(event);
      //if true, push pastEvents into events array

    } else if (startTime >= todayStart && startTime <= todayEnd) {
      //check if event's start time are within current day 

      todayEvents.push(event);
      //if true, push todayEvents into event's array

    } else {
      //if the event's start time are not  before or within current day, it has to be after current day

      futureEvents.push(event);
      //if true, push futureEvents into event's array
    }
  }

  var lr = ss.getLastRow();
  //retrieve the number of last row that has content in the sheet

  if (lr > 1) {
  //check if the number last row that has content is greater than 1

    ss.getRange(2, 1, lr - 1, 5).clearContent();
    //gets range of cell from sheet in the form of:
    //getRange(starting row, starting column, end row, end column)
    //lr-1 excluding header row (row 1)
    //clearContent() clears content in the given cell range
  }

  var allEvents = pastEvents.concat(todayEvents, futureEvents);
  //merge three arrays (pastEvents, today Events, futureEvents) into one array (allEvents) and return it

  var data = allEvents.map(function(event) {
  //map method applies function to each element in allEvents array
  //map method takes 'event' object as an argument

    return [                      
      event.getTitle(),       //retrieves event's title
      event.getStartTime(),   //retrieves event's start time
      event.getEndTime(),     //retrieves event's end time
      event.getLocation(),    //retrieves event's location
      event.getDescription()  //retrieves event's description
    ];
  });

  if (data.length > 0) { //check if data array has any element
    ss.getRange(2, 1, data.length, data[0].length).setValues(data);
    //specifies the range of cells 
    //set the values of specified range in the sheet to the values in data array
    //getRange format is the same as line 67

    var range = ss.getRange(2, 1, data.length, data[0].length);
    //specifies the range of cells

    var rule = SpreadsheetApp.newConditionalFormatRule()
    //creates a builder for new conditional formatting rule

      .whenDateBefore(todayStart) //any cell with a date before current day matches the condition
      .setBackground("#FFC0CB") //set pink colour for cells that meet the condition
      .setRanges([range]) //specifies the range of cells which the conditional rule will apply
      .build(); //finalise rule creation and returns the conditional formatting rule object
    
    var rule2 = SpreadsheetApp.newConditionalFormatRule()
      .whenDateEqualTo(todayStart) //any cell with a date equal to current day matches the condition
      .setBackground("#FFFF00") //yellow colour
      .setRanges([range])
      .build();
    
    var rule3 = SpreadsheetApp.newConditionalFormatRule()
      .whenDateAfter(todayEnd)  //any cell with a date after current day matches the condition
      .setBackground("#ADD8E6") //blue colour
      .setRanges([range])
      .build();
    
    var rules = ss.getConditionalFormatRules();
    //retrieves all existing conditional rule format in sheet and store them in rules array

    rules.push(rule); //adds rule object into rules array
    rules.push(rule2); //adds rule2 object into rules array
    rules.push(rule3); //adds rule3 object into rules array
    ss.setConditionalFormatRules(rules); //applies updated contional format rule to sheet

    emailNotifications();
    
  }
}
