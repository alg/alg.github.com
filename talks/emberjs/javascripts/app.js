// Main application
App = Em.Application.create({
  rootElement: '#app',
  // currently selected video
  selectedVideo: null
});

// Youtube video
App.Video = Em.Object.extend({
  title: null,
  seconds: null,
  yid: null
});

// Results list
App.searchResultsController = Em.ArrayController.create({
  // there are no videos initially
  content: [],

  // Searching flag
  isSearching: false,

  search: function(query) {
    var self = this;

    // Start searching and remove existing results
    this.set('isSearching', true);
    this.set('content', []);

    var c = $.getJSON("http://gdata.youtube.com/feeds/api/videos",
        { alt: 'json', 'max-results': 7, v: 2, q: query });

    c.success(function(data) {
      var entries = data.feed.entry, results = [];

      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        results.push(App.Video.create({
          yid: e.id.$t.split(':')[3],
          seconds: parseInt(e.media$group.yt$duration.seconds),
          title: e.title.$t
        }));
      }

      self.set('content', results);
    });

    c.complete(function() {
      self.set('isSearching', false);
    });
  }
});

// Search box use for search query entry
App.SearchBox = Em.TextField.extend({
  insertNewline: function() {
    var query = this.get('value');
    App.searchResultsController.search(query);
  }
});

// Results table row view
App.ResultRow = Em.View.extend({
  video: null,
  click: function(evt) {
    App.set('selectedVideo', this.get('video'));
  }
});

// Selected view player
App.Player = Em.View.extend({
  // current video
  videoBinding: "App.selectedVideo",

  // current video title
  videoTitle: function() {
    var video = this.get('video');
    return video ? video.get('title') : "Play video";
  }.property('video'),

  // current video url (computed)
  videoUrl: function() {
    return "http://www.youtube.com/embed/" + this.getPath('.video.yid');
  }.property("video")
});
