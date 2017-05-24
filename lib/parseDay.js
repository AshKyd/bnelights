const colours = ['red','orange','yellow','green','blue','white', 'black', 'maroon'];
module.exports = function(day){

  const events = {};
  day.venues.forEach(function(venue){
    if(!events[venue.title]) {
      events[venue.title] = {
        title: venue.title,
        description: venue.description,
        venues: [venue.venue],
      }
    } else {
      events[venue.title].venues.push(venue.venue);
    }
  });

  let eventsArray = Object.keys(events)
    .map(key => events[key])
    .map(function(event){
      const colorsWeighted = {};
      colours.forEach(function(colour){
        const indexOf = event.description.indexOf(colour);
        if(indexOf !== -1){
          colorsWeighted[colour] = indexOf;
        }
      });
      let colorsSorted = Object.keys(colorsWeighted);
      colorsSorted.sort(function(a, b){
        if(colorsWeighted[a] < colorsWeighted[b]){
          return 1;
        } else {
          return -1;
        }
      });
      event.colors = colorsSorted;
      return event;
    });

    return eventsArray;
}
