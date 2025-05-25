import type { Attribute, Schema } from '@strapi/strapi';

export interface MakeupartistsCourses extends Schema.Component {
  collectionName: 'components_makeupartists_courses';
  info: {
    description: '';
    displayName: 'Courses';
  };
  attributes: {
    course_description: Attribute.Text &
      Attribute.SetMinMaxLength<{
        maxLength: 2000;
      }>;
    date_graduation: Attribute.Date;
    diploma: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    school: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
  };
}

export interface MakeupartistsExperiences extends Schema.Component {
  collectionName: 'components_makeupartists_experiences';
  info: {
    description: '';
    displayName: 'Experiences';
  };
  attributes: {
    city: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    company: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    date_end: Attribute.Date;
    date_start: Attribute.Date;
    description: Attribute.Text &
      Attribute.SetMinMaxLength<{
        maxLength: 2000;
      }>;
    job_name: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
  };
}

export interface MakeupartistsLanguage extends Schema.Component {
  collectionName: 'components_makeupartists_languages';
  info: {
    description: '';
    displayName: 'language';
  };
  attributes: {
    name: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
  };
}

export interface MakeupartistsNetwork extends Schema.Component {
  collectionName: 'components_makeupartists_networks';
  info: {
    description: '';
    displayName: 'network';
  };
  attributes: {
    email: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    facebook: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    instagram: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    linkedin: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    phone: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
    website: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    youtube: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
  };
}

export interface MakeupartistsServiceOffers extends Schema.Component {
  collectionName: 'components_makeupartists_service_offers';
  info: {
    description: '';
    displayName: 'service_offers';
  };
  attributes: {
    description: Attribute.Text;
    name: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    options: Attribute.Component<'service-offers.options', true>;
    price: Attribute.Text &
      Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
  };
}

export interface MakeupartistsSkills extends Schema.Component {
  collectionName: 'components_makeupartists_skills';
  info: {
    description: '';
    displayName: 'skills';
  };
  attributes: {
    description: Attribute.Text &
      Attribute.SetMinMaxLength<{
        maxLength: 2000;
      }>;
    name: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
  };
}

export interface ServiceOffersOptions extends Schema.Component {
  collectionName: 'components_service_offers_options';
  info: {
    description: '';
    displayName: 'options';
  };
  attributes: {
    description: Attribute.Text &
      Attribute.SetMinMaxLength<{
        maxLength: 2000;
      }>;
    name: Attribute.String;
    price: Attribute.Text &
      Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
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
