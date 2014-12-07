oae-ui-dashboard
================

A dashboard widget based on d3.js for Open Academic Environment (OAE)

### 1. Install the widget

The front-end module provides the dashboard widget, which can be embedded anywhere in the UI. In order to install this widget, go to the 3akai-ux folder and run the following command:

    npm install git://github.com/seanlaff/oae-ui-dashboard

### 2. Define where the widget is shown

At this point, the UI is aware of the existence of the widget, but doesn’t yet know where it needs to be shown. If the widget needs to be triggered by clicking a certain button or link, this can be done through configuration in the widget manifest.


Add the following to 3akai-ux/ui/js/me.js to show it as one new menu on the left navigation (just before discussion widget)

    {
      'id': 'mydashboard',
      'title': oae.api.i18n.translate('Dashboard'),
      'icon': 'fa-list',
      'closeNav': true,
      'layout': [
      {
        'width': 'col-md-12',
        'widgets': [
        {
          'name': 'dashboard',
          'settings': {
            'context': oae.data.me,
            'canManage': true
          }
        }
        ]
      }
      ]
      },
      {
        'id': 'discussions',
        'title': oae.api.i18n.translate('__MSG__MY_DISCUSSIONS__'),
        'icon': 'fa-comments',
        'closeNav': true,
        'layout': [
        {
          'width': 'col-md-12',
          'widgets': [
          {
            'name': 'discussionslibrary',
            'settings': {
              'context': oae.data.me,
              'canManage': true
            }
          }
          ]
        }
        ]
        },
