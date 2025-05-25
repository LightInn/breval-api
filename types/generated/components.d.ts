import type { Schema, Struct } from '@strapi/strapi';

export interface MakeupartistsCourses extends Struct.ComponentSchema {
  collectionName: 'components_makeupartists_courses';
  info: {
    description: '';
    displayName: 'Courses';
  };
  attributes: {
    course_description: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 2000;
      }>;
    date_graduation: Schema.Attribute.Date;
    diploma: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    school: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
  };
}

export interface MakeupartistsExperiences extends Struct.ComponentSchema {
  collectionName: 'components_makeupartists_experiences';
  info: {
    description: '';
    displayName: 'Experiences';
  };
  attributes: {
    city: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    company: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    date_end: Schema.Attribute.Date;
    date_start: Schema.Attribute.Date;
    description: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 2000;
      }>;
    job_name: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
  };
}

export interface MakeupartistsLanguage extends Struct.ComponentSchema {
  collectionName: 'components_makeupartists_languages';
  info: {
    description: '';
    displayName: 'language';
  };
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
  };
}

export interface MakeupartistsNetwork extends Struct.ComponentSchema {
  collectionName: 'components_makeupartists_networks';
  info: {
    description: '';
    displayName: 'network';
  };
  attributes: {
    email: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    facebook: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    instagram: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    linkedin: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    phone: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
    website: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    youtube: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
  };
}

export interface MakeupartistsServiceOffers extends Struct.ComponentSchema {
  collectionName: 'components_makeupartists_service_offers';
  info: {
    description: '';
    displayName: 'service_offers';
  };
  attributes: {
    description: Schema.Attribute.Text;
    name: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    options: Schema.Attribute.Component<'service-offers.options', true>;
    price: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
  };
}

export interface MakeupartistsSkills extends Struct.ComponentSchema {
  collectionName: 'components_makeupartists_skills';
  info: {
    description: '';
    displayName: 'skills';
  };
  attributes: {
    description: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 2000;
      }>;
    name: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
  };
}

export interface ServiceOffersOptions extends Struct.ComponentSchema {
  collectionName: 'components_service_offers_options';
  info: {
    description: '';
    displayName: 'options';
  };
  attributes: {
    description: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 2000;
      }>;
    name: Schema.Attribute.String;
    price: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'makeupartists.courses': MakeupartistsCourses;
      'makeupartists.experiences': MakeupartistsExperiences;
      'makeupartists.language': MakeupartistsLanguage;
      'makeupartists.network': MakeupartistsNetwork;
      'makeupartists.service-offers': MakeupartistsServiceOffers;
      'makeupartists.skills': MakeupartistsSkills;
      'service-offers.options': ServiceOffersOptions;
    }
  }
}
