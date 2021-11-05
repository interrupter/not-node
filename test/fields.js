const InitCore = require('../src/init/core');

const expect = require('chai').expect,
  Fields = require('../src/fields');


describe('Fields', function() {
  before(()=>{
    Fields.importFromDir(InitCore.paths.fields);
  });

  describe('registerField', function() {

    it('name not exists, value, options is not provided', function() {
      const fieldName = `field_name_${Math.random()}`;
      const fieldValue = {
        ui: {
          component: 'UITextfield'
        },
        model: {
          type: 'String'
        }
      };
      expect(Object.keys(Fields.LIB).includes(fieldName)).to.be.false;
      Fields.registerField(fieldName, fieldValue);
      expect(Object.keys(Fields.LIB).includes(fieldName)).to.be.true;
    });

    it('name exists, value, options is not provided', function() {
      const fieldName = `field_name_${Math.random()}`;
      const fieldValue1 = {
        ui: {
          component: 'UITextfield'
        },
        model: {
          type: 'String'
        }
      };
      const fieldValue2 = {
        ui: {
          component: 'UISpecialField'
        },
        model: {
          type: 'StringNew',
          optimal: true
        }
      };
      expect(Object.keys(Fields.LIB).includes(fieldName)).to.be.false;
      Fields.registerField(fieldName, fieldValue1);
      expect(Object.keys(Fields.LIB).includes(fieldName)).to.be.true;
      Fields.registerField(fieldName, fieldValue2);
      expect(Fields.LIB[fieldName]).to.be.deep.equal(fieldValue2);
    });

    it('name exists, value, overwrite - true', function() {
      const fieldName = `field_name_${Math.random()}`;
      const fieldValue1 = {
        ui: {
          component: 'UITextfield'
        },
        model: {
          type: 'String'
        }
      };
      const fieldValue2 = {
        ui: {
          component: 'UISpecialField'
        },
        model: {
          type: 'StringNew',
          optimal: true
        }
      };
      expect(Object.keys(Fields.LIB).includes(fieldName)).to.be.false;
      Fields.registerField(fieldName, fieldValue1);
      expect(Object.keys(Fields.LIB).includes(fieldName)).to.be.true;
      Fields.registerField(fieldName, fieldValue2, {
        overwrite: true
      });
      expect(Fields.LIB[fieldName]).to.be.deep.equal(fieldValue2);
    });

    it('name exists, value, overwrite - false, compose - false', function() {
      const fieldName = `field_name_${Math.random()}`;
      const fieldValue1 = {
        ui: {
          component: 'UITextfield'
        },
        model: {
          type: 'String'
        }
      };
      const fieldValue2 = {
        ui: {
          component: 'UISpecialField'
        },
        model: {
          type: 'StringNew',
          optimal: true
        }
      };
      expect(Object.keys(Fields.LIB).includes(fieldName)).to.be.false;
      Fields.registerField(fieldName, fieldValue1);
      expect(Object.keys(Fields.LIB).includes(fieldName)).to.be.true;
      Fields.registerField(fieldName, fieldValue2, {
        overwrite: false,
        compose: false
      });
      expect(Fields.LIB[fieldName]).to.be.deep.equal(fieldValue1);
    });
  });

  describe('initFields', function() {
    it('list empty, type is not provided', () => {
      expect(Fields.initFields([])).to.be.deep.equal({});
    });

    it('list not empty, type is not provided', () => {
      expect(Fields.initFields(['title', 'uuid'])).to.be.deep.equal({
        title: {
          component: 'UITextfield',
          placeholder: 'core:field_title_placeholder',
          label: 'core:field_title_label'
        },
        uuid: {
          component: 'UITextfield',
          placeholder: 'core:field_UUID_placeholder',
          label: 'core:field_UUID_label',
          readonly: true
        }
      });
    });
  });


  describe('initField', function() {
    it('field empty, resultOnly not provided, type not provided', () => {
      expect(Fields.initField('')).to.be.deep.equal({});
    });

    it('field, resultOnly not provided, type not provided', () => {
      expect(Fields.initField('title')).to.be.deep.equal({
        component: 'UITextfield',
        placeholder: 'core:field_title_placeholder',
        label: 'core:field_title_label'
      });
    });

    it('field, resultOnly - false, type not provided', () => {
      expect(Fields.initField('title', false)).to.be.deep.equal(['title', {
        component: 'UITextfield',
        placeholder: 'core:field_title_placeholder',
        label: 'core:field_title_label'
      }]);
    });

    it('field, resultOnly - false, type - model', () => {
      expect(Fields.initField('title', false, 'model')).to.be.deep.equal(['title', {
        type: String,
        required: true,
        searchable: true,
        sortable: true,
        safe: {
          update: ['@owner', 'root', 'admin'],
          read: ['@owner', 'root', 'admin']
        }
      }]);
    });


    it('field - [src, mutation], resultOnly - false, type - model', () => {
      const field = [
        'title',
        {
          sortable: false,
          safe: {
            update: ['*'],
            read: ['*'],
          }
        }
      ];
      expect(Fields.initField(field, false, 'model')).to.be.deep.equal(['title', {
        type: String,
        required: true,
        searchable: true,
        sortable: false,
        safe: {
          update: ['*'],
          read: ['*'],
        }
      }]);
    });

    it('field - [dest, mutation, src], resultOnly - false, type - model', () => {
      const field = [
        'titleOfBilbao',
        {
          sortable: false,
          safe: {
            update: ['*'],
            read: ['*'],
          }
        },
        'title'
      ];
      expect(Fields.initField(field, false, 'model')).to.be.deep.equal(['titleOfBilbao', {
        type: String,
        required: true,
        searchable: true,
        sortable: false,
        safe: {
          update: ['*'],
          read: ['*'],
        }
      }]);
    });
  });

  describe('getMutationForField', function() {
    it('name and list supplied, list contains name', () => {
      const list = [
        'tite',
        ['tile'],
        ['title', {mutant: true}]
      ];
      expect(Fields.getMutationForField('title', list)).to.be.deep.equal(['title', {mutant: true}]);
    });

    it('name and list supplied, list doesnt contain name', () => {
      const list = [
        'tite',
        ['tile'],
        ['title', {mutant: true}]
      ];
      expect(Fields.getMutationForField('titler', list)).to.be.deep.equal(false);
    });
  });

  describe('fromSchema', function() {
    it('schema(title, uuid), rawMutationsList = []', () => {
      const schema = {
        title:{},
        uuid: {},
      };
      expect(Fields.fromSchema(schema)).to.be.deep.equal({
        title:{
          component: 'UITextfield',
          placeholder: 'core:field_title_placeholder',
          label: 'core:field_title_label'
        },
        uuid:{
          component: 'UITextfield',
          placeholder: 'core:field_UUID_placeholder',
          label: 'core:field_UUID_label',
          readonly: true
        }
      });
    });

    it('schema - empty, rawMutationsList = []', () => {
      expect(Fields.fromSchema('')).to.be.deep.equal({});
    });

    it('schema(title, uuid), rawMutationsList = []', () => {
      const schema = {
        title:{},
        uuid: {},
      };
      const mutations = [
        ['title', {
          label: 'Naming'
        }]
      ];
      expect(Fields.fromSchema(schema,mutations)).to.be.deep.equal({
        title:{
          component: 'UITextfield',
          placeholder: 'core:field_title_placeholder',
          label: 'Naming'
        },
        uuid:{
          component: 'UITextfield',
          placeholder: 'core:field_UUID_placeholder',
          label: 'core:field_UUID_label',
          readonly: true
        }
      });
    });
  });



});
