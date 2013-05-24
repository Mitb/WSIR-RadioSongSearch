App = Ember.Application.create({
    LOG_TRANSITIONS: true
});

var query;
var page;


App.Router.map(function() {
    this.route('search', { path: '/search/:query/:page' });
    this.route('song', { path: '/song/:id' });
    this.route('artist', { path: '/artist/:id' });
    this.route('album', { path: '/album/:id' });
});

App.ApplicationController = Ember.Controller.extend({

})

App.IndexRoute = Ember.Route.extend({  
    events: {
        search: function(query, page) {
            page = page ? page : 1;
            var res = App.SearchResult.find({query: query, page: page});
            var controller = this.controllerFor('searchResult');
            controller.set('content', {});
            controller.set('result', res);
            this.transitionTo('search', {query:query, page: page});
        }
    },
    serialize: function(model) {
      return model
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
      search: function(query, page) {
          var res = App.SearchResult.find({query: query, page: page});
          var controller = this.controllerFor('searchResult');
          controller.set('content', {});
          controller.set('result', res);
          this.transitionTo('search', query, page);
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
      search: function(query, page) {
          this.transitionTo('search', query, page);
          var res = App.SearchResult.find({query: query, page: page});
          var controller = this.controllerFor('searchResult');
          controller.set('content', {});
          controller.set('result', res);
      }
  }
});

App.AlbumRoute = Ember.Route.extend({
  model: function(params) {
     return params.id;
  },
  setupController: function(controller, modelId) {
    var detailsModel = App.AlbumDetail.find(modelId);
    this.controllerFor('albumDetail').set('content', detailsModel);
  },
  renderTemplate: function() {
    this.render('albumDetail');
  },
  events: {
      search: function(query, page) {
          this.transitionTo('search', query, page);
          var res = App.SearchResult.find({query: query, page: page});
          var controller = this.controllerFor('searchResult');
          controller.set('content', {});
          controller.set('result', res);
      }
  }
});


App.SearchRoute = Ember.Route.extend({
    
    model: function(params) {
        query =  params.query;
        page = parseInt(params.page);
        return App.SearchResult.find({query: params.query, page: params.page});
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
      console.log("requested details of type: " + type + " id:" + id);
      switch (type) {
          case "artist": 
          modelClass = App.ArtistDetail;
          break;
          case "song": 
          modelClass = App.SongDetail;
          break;
          case "album": 
          modelClass = App.AlbumDetail;
          break;
          default: console.log("unknown type: " + model.type); 
      }
      console.log("determined model calss:" + modelClass);
      return modelClass.find(id);
    },
    
    events: {        
        search: function(query, page) {  
            var url = /(.*\/)(.*$)/.exec(document.URL);   
            history.pushState(null, null, url[1] + query );
            var res = App.SearchResult.find({query: query, page: page});
            var controller = this.controllerFor('searchResult');
           
            // clear details
            parentView = this.router._lookupActiveView('searchResults');
            parentView.disconnectOutlet('details');
           
            controller.set('content', {});
            controller.set('result', res);
            this.transitionTo('search', {query: query, page: page});
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
    },
    serialize: function(model) {
      return model
    }
});

App.SearchFormView = Ember.View.extend({
    templateName: "searchForm",
  
    submit: function(evt){
        evt.preventDefault(); 
        var query = $('#searchbar').val();
        var re = new RegExp(' ', 'g');
        var escapedQuery = query.replace(re, "%20");
        var page = 1;
        setTimeout(function(){    window.location.reload()}, 0);
        this.get('controller').send('search', escapedQuery, page);
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

  pageNumbers: function(){
    var pages = [];
    var startNumber = page;
    var pageCount = this.get('result.firstObject.hits') / 10;
    if(page>2){
      startNumber = startNumber - 2;
    }else{
      startNumber = 1;
    }
    for (var i = (startNumber); i <=  Math.min(startNumber+5, Math.ceil(pageCount)); i++) {
      pages.push(i)
    }
    return pages;
  }.property('result'),

  changePage: function(pageNumber){
    if(pageNumber === "pre"){
      if(page > 1){
        pageNumber = parseInt(page-1);
      }else{
        pageNumber = page;
      }
    }
    if (pageNumber === "next") {
      if(page < Math.ceil(this.get('result.firstObject.hits') / 10)){
        pageNumber = parseInt(page+1);
      }else{
        pageNumber = page;
      }      
    };
    setTimeout(function(){    window.location.reload()}, 0);
    this.transitionToRoute('search', {query: query, page: pageNumber});
  },

  formerQuery: function(){
    var re = new RegExp(find, '%20');
    return query.replace(re, " ");
  }.property('formerQuery')

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

App.AlbumDetailController = Ember.ObjectController.extend({

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

App.AlbumDetailView = Ember.View.extend({
    templateName: 'albumDetails'
});

