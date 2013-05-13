App = Ember.Application.create({
    LOG_TRANSITIONS: true
});


App.Router.map(function() {
    this.route('search', { path: '/search/:query' });
    this.route('song', { path: '/song/:id' });
    this.route('artist', { path: '/artist/:id' });
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

App.SongRoute = Ember.Route.extend({
  model: function(params) {
     return params.id;
  },
  setupController: function(controller, modelId) {
     var detailsModel = App.SongDetail.find(modelId)
     this.controllerFor('songDetail').set('content', detailsModel);
  },
  renderTemplate: function() {
    this.render('songDetail');
  },
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

App.ArtistRoute = Ember.Route.extend({
  model: function(params) {
     return params.id;
  },
  setupController: function(controller, modelId) {
    var detailsModel = App.ArtistDetail.find(modelId);
    this.controllerFor('artistDetail').set('content', detailsModel);
  },
  renderTemplate: function() {
    this.render('artistDetail');
  },
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
    
    getDetailsModel: function(type, id){
      var modelClass;
      switch (type) {
          case "artist": 
          modelClass = App.ArtistDetail
          break;
          case "song": 
          modelClass = App.SongDetail
          break;
          default: console.log("unknown type: " + model.type); 
      }
      return modelClass.find(id);
    },
    
    events: {        
        search: function(query) {  
            var url = /(.*\/)(.*$)/.exec(document.URL);   
            history.pushState(null, null, url[1] + query);
            var res = App.SearchResult.find({query: query});
            var controller = this.controllerFor('searchResult');
           
            // clear details
            parentView = this.router._lookupActiveView('searchResults');
            parentView.disconnectOutlet('details');
           
            controller.set('content', {});
            controller.set('result', res);
        },
        
        showDetails: function(model) {
            var type = model.get('type');
            var id = model.get('typeId');
            
            var detailsModel = this.getDetailsModel(type, id);
            var controller = this.controllerFor(type + 'Detail');
            controller.set('content', detailsModel);
            this.render(type + 'Detail', {
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
    },
  
});

App.SearchResultsView = Ember.View.extend({
    templateName: "searchResults",
    topHit: null,
    didInsert: false,
    
    determineTopHit: function(){
      var resultObject = this.get('controller.content.result.firstObject');
      if(resultObject){
       var results = resultObject.get('items');
       var topHit = results.get('firstObject');
       this.set('topHit',topHit);
      }
    }.observes('controller.content.result.firstObject.items.firstObject'),
   
    didInsertElement: function(){
      this.set('didInsert', true)
   },
   
   showTopHitDetails: function(){
     var topHit = this.get('topHit');
     var inserted = this.get('didInsert');
     console.log('th:' + topHit.get('name'));
     if(inserted && topHit){
       var controller = this.get('controller');
       controller.send('showDetails', topHit);
    }
   }.observes('topHit','didInsert')
   
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

App.SongDetailController = Ember.ObjectController.extend({

});

App.DetailView = Ember.View.extend({
    didInsert: false,
    
    didInsertElement: function(){
        this.set('didInsert', true)
        this.renderSpinsByStationDonut();
        this.renderSpinsOverTimeArea();
    },
    
    renderSpinsByStationDonut: function() {
        var donut = this.get('controller.content.spinsByStationDonut');
        var didInsert = this.get('didInsert');
        
        if( didInsert && donut) {
            Morris.Donut({
                element: 'spins-by-station-donut',
                caption: 'Spins by Station',
                data: donut.get('data')
            });
        }
    }.observes('controller.content.spinsByStationDonut'),
    
    renderSpinsOverTimeArea: function(){
        var area = this.get('controller.content.spinsOverTimeArea');
        var didInsert = this.get('didInsert');
        
        if( didInsert && area) {
            Morris.Area({
                element: 'spins-over-time',
                data: area.get('data'),
                xkey: area.get('xkey'),
                ykeys: area.get('ykeys'),
                labels: area.get('labels'),
                pointSize: 2,
                hideHover: 'auto'
            });
        }
    }.observes('controller.content.spinsOverTimeArea')
});


App.SongDetailView = App.DetailView.extend({
    templateName: 'songDetails'
});

App.ArtistDetailView = App.DetailView.extend({
    templateName: 'artistDetails'
});    
