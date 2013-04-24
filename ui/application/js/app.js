App = Ember.Application.create({
    LOG_TRANSITIONS: true
});


App.Router.map(function() {
    this.route('search', { path: '/search/:query' });
});

App.IndexRoute = Ember.Route.extend({  
    events: {
        search: function(query) {
            this.transitionTo('search', query);
            var res = App.SearchResult.find({query: query});
            var controller = this.controllerFor('searchResult');
            controller.set('content', {});
            controller.set('result', res);
         }
    }
});

App.SearchRoute = Ember.Route.extend({
    
    model: function(params) {
        return App.SearchResult.find({query: params.query});
      },
  
    setupController: function(controller, model) {
      if(model) {
        var searchCont = this.controllerFor('searchResult');
        searchCont.set('content', {});
        searchCont.set('result', model);            
      }
    },
    
    renderTemplate: function() {   
        var controller = this.controllerFor('searchResult');
        this.render('searchResults', { controller: controller });
        this.render('resultsList', {
              into: 'searchResults',
              outlet: 'results',
              controller: controller
        });
    },
    events: {
        
        search: function(query) {  
            var url = /(.*\/)(.*$)/.exec(document.URL);   
            history.pushState(null, null, url[1] + query);
            var res = App.SearchResult.find({query: query});
            var controller = this.controllerFor('searchResult');
            controller.set('result', res);
        },
        
        showDetails: function(model) {
            var modelClass;
            var modelType = model.get('type');
            switch (modelType) {
               case "artist": 
                 modelClass = App.ArtistDetail
                 break;
               case "band":
                 modelClass = App.BandDetail
                 break;
               case "track": 
                 modelClass = App.TrackDetail
                 break;
               default: console.log("unknown type: " + model.type); 
             }
            var detailsModel = modelClass.find(model.get('typeId'));
            var controller = this.controllerFor(modelType + 'Detail')
            controller.set('content', detailsModel);
            this.render(modelType + 'Detail', {
                  into: 'searchResults',
                  outlet: 'details',
                  controller: controller
            });
        }
    }
});

App.SearchFormView = Ember.View.extend({
  templateName: "searchForm",
  
  submit: function(evt){
      evt.preventDefault(); 
      var query = $('#searchbar').val();
      this.get('controller').send('search', query);
  }
  
});

App.SearchResultsView = Ember.View.extend({
  templateName: "searchResults",
  
});

App.SearchResultController = Ember.ObjectController.extend({

});


App.SearchResultItemView = Ember.View.extend({
  templateName: 'searchResultItem',

  mouseEnter: function(evt) {
      var controller = this.get('controller');
      var model = controller.get('content');
      controller.send('showDetails', model);
      App.SearchResultItemView.deselectAll();
      this.set('selected', true);
    }
  
});

App.SearchResultItemView.reopenClass({
    itemViews: [],
  
    deselectAll: function() {
       this.itemViews.forEach(function(view) {
         view.set('selected', false);
       });
    },
});

App.SearchResultItemView.reopen({
    init: function() {
      this._super();
      App.SearchResultItemView.itemViews.pushObject(this);
    },
    destroy: function() {
      App.SearchResultItemView.itemViews.removeObject(this);
      this._super();
    } 
});

App.SearchResultItemController = Ember.ObjectController.extend({
    // Don't delete otherwise view has no access to model anymore
});

App.ArtistDetailController = Ember.ObjectController.extend({

});

App.BandDetailController = Ember.ObjectController.extend({

});

App.TrackDetailController = Ember.ObjectController.extend({

});

App.ArtistDetailView = Ember.View.extend({
    templateName: 'artistDetails',
    
    didInsertElement: function(){
      this.renderSpinsByStationDonut();
      this.renderSpinsOverTime();
    },
    
    renderSpinsByStationDonut: function() {
        Morris.Donut({
          element: 'spins-by-station-donut',
          caption: 'Spins by Station',
          data: [
            {label: "DasDing", value: 50},
            {label: "SWR3", value: 100},
            {label: "BigFM", value: 110}
          ]
        });
    },
    
    renderSpinsOverTime: function(){
        Morris.Area({
           element: 'spins-over-time',
           data: [
             {period: '2010 Q1', ding: 2666, swr3: null, bigfm: 2647},
             {period: '2010 Q2', ding: 2778, swr3: 2294, bigfm: 2441},
             {period: '2010 Q3', ding: 4912, swr3: 1969, bigfm: 2501},
             {period: '2010 Q4', ding: 3767, swr3: 3597, bigfm: 5689},
             {period: '2011 Q1', ding: 6810, swr3: 1914, bigfm: 2293},
             {period: '2011 Q2', ding: 5670, swr3: 4293, bigfm: 1881},
             {period: '2011 Q3', ding: 4820, swr3: 3795, bigfm: 1588},
             {period: '2011 Q4', ding: 15073, swr3: 5967, bigfm: 5175},
             {period: '2012 Q1', ding: 10687, swr3: 4460, bigfm: 2028},
             {period: '2012 Q2', ding: 8432, swr3: 5713, bigfm: 1791}
           ],
           xkey: 'period',
           ykeys: ['ding', 'swr3', 'bigfm'],
           labels: ['DasDing', 'SWR3', 'BigFM'],
           pointSize: 2,
           hideHover: 'auto'
         });
    },
    
    renderGraphs: function() {
        new Morris.Line({
          // ID of the element in which to draw the chart.
          element: 'myfirstchart',
          // Chart data records -- each entry in this array corresponds to a point on
          // the chart.
          data: [
            { year: '2008', value: 20 },
            { year: '2009', value: 10 },
            { year: '2010', value: 5 },
            { year: '2011', value: 5 },
            { year: '2012', value: 20 }
          ],
          // The name of the data record attribute that contains x-values.
          xkey: 'year',
          // A list of names of data record attributes that contain y-values.
          ykeys: ['value'],
          // Labels for the ykeys -- will be displayed when you hover over the
          // chart.
          labels: ['Value']
        });
    }
});
