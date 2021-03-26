/*global app, jasmine, describe, it, beforeEach, expect */

describe('controller', function () {
	'use strict';

	var subject, model, view;

	var setUpModel = function (todos) {
		model.read.and.callFake(function (query, callback) {
			callback = callback || query;
			callback(todos);
		});

		model.getCount.and.callFake(function (callback) {
			var todoCounts = {
				active: 0,
				completed: 0,
				total: 0
			}
			
			todos.forEach(function (todo) {
				if (todo.completed) {
					todoCounts.completed++;
				} else {
					todoCounts.active++;
				}

				todoCounts.total++;
			});
			
			/*var todoCounts = {
				active: todos.filter(function (todo) {
					return !todo.completed;
				}).length,
				completed: todos.filter(function (todo) {
					return !!todo.completed;
				}).length,
				total: todos.length
			};*/

			callback(todoCounts);
		});

		model.remove.and.callFake(function (id, callback) {
			callback();
		});

		model.create.and.callFake(function (title, callback) {
			callback();
		});

		model.update.and.callFake(function (id, updateData, callback) {
			callback();
		});
	};

	var createViewStub = function () {
		var eventRegistry = {};
		return {
			render: jasmine.createSpy('render'),
			bind: function (event, handler) {
				eventRegistry[event] = handler;
			},
			trigger: function (event, parameter) {
				eventRegistry[event](parameter);
			}
		};
	};

	beforeEach(function () {
		model = jasmine.createSpyObj('model', ['read', 'getCount', 'remove', 'create', 'update']);
		view = createViewStub();
		subject = new app.Controller(model, view);
	});

	it('should show entries on start-up', function () {
		// TODO: write test
        var todo = {title: 'my todo'}; //Je creer un objet todo
		setUpModel([todo]); //J’envoi l’objet au modèle virtuel
		
		subject.setView(''); //Je demande au contrôleur la vue all pour afficher toutes les tâches
		
		expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
		/*J’espionne la méthode View::render() pour vérifier que le contrôleur 
        demande à la vue d'afficher toutes les tâches*/
	});

	describe('routing', function () {

		it('should show all entries without a route', function () {
			var todo = {title: 'my todo'};
			setUpModel([todo]);

			subject.setView('');

			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
		});

		it('should show all entries without "all" route', function () {
			var todo = {title: 'my todo'};
			setUpModel([todo]);

			subject.setView('#/');

			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
		});

		it('should show active entries', function () {
			// TODO: write test
            var todo = {title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('#/active'); 
			//Je demande au contrôleur de router sur la vue #/active pour afficher les tâches actives

			expect(model.read).toHaveBeenCalledWith({completed: false}, jasmine.any(Function));
			//J’espionne Model::read() pour vérifier que le contrôleur recherche bien les tâches non complétée
			
			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
			//Ensuite, le contrôleur doit demander à la vue d'afficher les tâches en questions
		});

		it('should show completed entries', function () {
			// TODO: write test
            var todo = {title: 'my todo', completed: true};
			setUpModel([todo]);

			subject.setView('#/completed');

			expect(model.read).toHaveBeenCalledWith({completed: true}, jasmine.any(Function));
			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
		});
	});

	it('should show the content block when todos exists', function () {
		setUpModel([{title: 'my todo', completed: true}]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('contentBlockVisibility', {
			visible: true
		});
	});

	it('should hide the content block when no todos exists', function () {
		setUpModel([]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('contentBlockVisibility', {
			visible: false
		});
	});

	it('should check the toggle all button, if all todos are completed', function () {
		setUpModel([{title: 'my todo', completed: true}]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('toggleAll', {
			checked: true
		});
	});

	it('should set the "clear completed" button', function () {
		var todo = {id: 42, title: 'my todo', completed: true};
		setUpModel([todo]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('clearCompletedButton', {
			completed: 1,
			visible: true
		});
	});

	it('should highlight "All" filter by default', function () {
		// TODO: write test
        setUpModel([]);

		subject.setView('');
		expect(view.render).toHaveBeenCalledWith('setFilter', '');
		//Je verifie que le controleur demande à la vue de mettre en évidence le filtre All
	});

	it('should highlight "Active" filter when switching to active view', function () {
		// TODO: write test
        setUpModel([]);

		subject.setView('#/active'); 
		//Je demande au contrôleur de router sur la vue #/active pour afficher les tâches actives
		
		expect(view.render).toHaveBeenCalledWith('setFilter', 'active');
		//Je verifie que le controleur demande à la vue de mettre en évidence le filtre Active
	});

	describe('toggle all', function () {
		it('should toggle all todos to completed', function () {
			// TODO: write test
            var todos = [{id: 42, title: 'my todo', completed: false}];
			setUpModel(todos);

			subject.setView('');
			
			view.trigger('toggleAll', {completed: true});
			//Je simule l'appelle de l'événement click sur la checkbox toggle-All en la validant fictivement

			for(var i = 0; i < todos.length; i++) {
				var todo = todos[i];

				expect(model.update).toHaveBeenCalledWith(todo.id, {completed: true}, jasmine.any(Function));
				//Je verifie que le contrôleur demande au model de modifier les taches en les completant.
			}
		});

		it('should update the view', function () {
			// TODO: write test
            var todos = [{id: 42, title: 'my todo', completed: true}];
			setUpModel(todos);

			subject.setView('');
			
			view.trigger('toggleAll', {completed: true});
			//Je simule l'appelle de l'événement click sur la checkbox toggle-All en la validant fictivement
			
			for(var i = 0; i < todos.length; i++) {
				var todo = todos[i];
		
				expect(view.render).toHaveBeenCalledWith('elementComplete', {id: todo.id, completed: true});
				//Je vérifie que le contrôleur demande à la vue de rendre les tâches complétées
			}

			expect(view.render).toHaveBeenCalledWith('updateElementCount', 0);
			//Ensuite, la vue doit placer le nombre d'element actif a zero

			expect(view.render).toHaveBeenCalledWith('clearCompletedButton', {completed: todos.length, visible: true});
			//Ensuite, la vue doit rendre le bouton clearCompletedButton visible

			expect(view.render).toHaveBeenCalledWith('toggleAll', {checked: true});
			//Ensuite, la vue doit valider la checkbox toogle-all
		});
	});

	describe('new todo', function () {
		it('should add a new todo to the model', function () {
			// TODO: write test
            setUpModel([]);

			subject.setView('');
			view.trigger('newTodo', 'a new todo');
			//Je simule l'ajout d'une nouvelle tâche

			expect(model.create).toHaveBeenCalledWith('a new todo', jasmine.any(Function));
			//Je vérifie que le contrôleur demande au modele de créer une nouvelle tâche
		});

		it('should add a new todo to the view', function () {
			setUpModel([]);

			subject.setView('');

			view.render.calls.reset();
			model.read.calls.reset();
			model.read.and.callFake(function (callback) {
				callback([{
					title: 'a new todo',
					completed: false
				}]);
			});

			view.trigger('newTodo', 'a new todo');

			expect(model.read).toHaveBeenCalled();

			expect(view.render).toHaveBeenCalledWith('showEntries', [{
				title: 'a new todo',
				completed: false
			}]);
		});

		it('should clear the input field when a new todo is added', function () {
			setUpModel([]);

			subject.setView('');

			view.trigger('newTodo', 'a new todo');

			expect(view.render).toHaveBeenCalledWith('clearNewTodo');
		});
	});

	describe('element removal', function () {
		it('should remove an entry from the model', function () {
			// TODO: write test
            var todo = {id: 42, title: 'my todo', completed: true};
			setUpModel([todo]);

			subject.setView('');
			view.trigger('itemRemove', todo);
			//Je simule la supression d'une tâche

			expect(model.remove).toHaveBeenCalledWith(todo.id, jasmine.any(Function));
			//Je verifie que le controleur demande au modele de suprimmer la tâche
		});

		it('should remove an entry from the view', function () {
			var todo = {id: 42, title: 'my todo', completed: true};
			setUpModel([todo]);

			subject.setView('');
			view.trigger('itemRemove', {id: 42});

			expect(view.render).toHaveBeenCalledWith('removeItem', 42);
		});

		it('should update the element count', function () {
			var todo = {id: 42, title: 'my todo', completed: true};
			setUpModel([todo]);

			subject.setView('');
			view.trigger('itemRemove', {id: 42});

			expect(view.render).toHaveBeenCalledWith('updateElementCount', 0);
		});
	});

	describe('remove completed', function () {
		it('should remove a completed entry from the model', function () {
			var todo = {id: 42, title: 'my todo', completed: true};
			setUpModel([todo]);

			subject.setView('');
			view.trigger('removeCompleted');

			expect(model.read).toHaveBeenCalledWith({completed: true}, jasmine.any(Function));
			expect(model.remove).toHaveBeenCalledWith(42, jasmine.any(Function));
		});

		it('should remove a completed entry from the view', function () {
			var todo = {id: 42, title: 'my todo', completed: true};
			setUpModel([todo]);

			subject.setView('');
			view.trigger('removeCompleted');

			expect(view.render).toHaveBeenCalledWith('removeItem', 42);
		});
	});

	describe('element complete toggle', function () {
		it('should update the model', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);
			subject.setView('');

			view.trigger('itemToggle', {id: 21, completed: true});

			expect(model.update).toHaveBeenCalledWith(21, {completed: true}, jasmine.any(Function));
		});

		it('should update the view', function () {
			var todo = {id: 42, title: 'my todo', completed: true};
			setUpModel([todo]);
			subject.setView('');

			view.trigger('itemToggle', {id: 42, completed: false});

			expect(view.render).toHaveBeenCalledWith('elementComplete', {id: 42, completed: false});
		});
	});

	describe('edit item', function () {
		it('should switch to edit mode', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEdit', {id: 21});

			expect(view.render).toHaveBeenCalledWith('editItem', {id: 21, title: 'my todo'});
		});

		it('should leave edit mode on done', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', {id: 21, title: 'new title'});

			expect(view.render).toHaveBeenCalledWith('editItemDone', {id: 21, title: 'new title'});
		});

		it('should persist the changes on done', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', {id: 21, title: 'new title'});

			expect(model.update).toHaveBeenCalledWith(21, {title: 'new title'}, jasmine.any(Function));
		});

		it('should remove the element from the model when persisting an empty title', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', {id: 21, title: ''});

			expect(model.remove).toHaveBeenCalledWith(21, jasmine.any(Function));
		});

		it('should remove the element from the view when persisting an empty title', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', {id: 21, title: ''});

			expect(view.render).toHaveBeenCalledWith('removeItem', 21);
		});

		it('should leave edit mode on cancel', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditCancel', {id: 21});

			expect(view.render).toHaveBeenCalledWith('editItemDone', {id: 21, title: 'my todo'});
		});

		it('should not persist the changes on cancel', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditCancel', {id: 21});

			expect(model.update).not.toHaveBeenCalled();
		});
	});
});
