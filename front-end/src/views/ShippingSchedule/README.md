# Shipping Schedule

## About

[Mercado Libre's DEV DOCS](https://developers.mercadolivre.com.br/pt_br/horarios-de-despacho-por-logistica)

[Mercado Libre's SELLER DOCS](https://vendedores.mercadolivre.com.br/nota/despache-suas-vendas-no-prazo-a-chave-para-uma-boa-reputacao/)

O recurso /schedule permite ao integrador obter informação sobre os horários de despacho que o vendedor necessita para evitar atrasos e impacto na sua reputação. Para consultar esta informação, é necessário saber os tipos de logísticas habilitadas na conta.

Rotas no postman: /Shipping

Front-end application route: /horarios-despacho

## Extending the Shipping Schedule's options

To extend the view's options, simply add a new object containg the `id` and `label` values
inside the array located at src/views/ShippingSchedule/shippingScheduleTypes.js.

## Features

    * Select Mercado Libre's account;
    * Select multiple shipping schedule types;
    * Visualyze shipping schedules by type;

## To Do List

### Tests

    [x] Implement rendering test using enzyme;

### Create shipping schedules types list

    [x] Create file shippingSchedulesTypes.js at view's root;
    [x] Return an array containg types as the following: `[{ id: "drop_off", label: "Mercado Envios"}]`
    * IMPORTANT: schedules types must be always referenced using this file's content;

### Create view's context

    [x] Import react's context api;
    [x] Export context, provider, consumer;
    [x] Implement Provider at view's index file;

### Create shipping schedules custom hook

    [x] Create schedules state as object;
    [x] Handle loading indendently for each schedule type inside state;
    [x] Handle errors independently for each schedule type inside state;
    [x] API fetch schedules using custom hook;
    [x] Save schedule returned from API inside state OR save error;

### Select account dropdown

    [x] Import src/components/SelectAccounts;
    [x] Consume view's context;
    [x] Set select single only;
    [x] Config selected, handle selection;
    [x] Invoke component in view;

### Select shipping schedule types

    [x] Import react-picky;
    [x] Consume view's context;
    [x] Set multi-select from options: 
      - drop_off;
      - xd_drop_off;
      - self_service;
      - cross_docking.
    [x] Config selected, handle selection;
    [x] Invoke component in view;

### Search button

    [x] Import custom shipping schedule hook;
    [x] Consume view's context (selectedAccount and selectedScheduleTypes);
    [x] Set CoreUI btn;
    [x] Config on click call hook for each selected;
    [x] Invoke component in view;

### Dynamic content table

    [x] Import CDataTable;
    [x] Consume view's context;
    [x] Each card should handle asyncronous loading;
    [x] Each card should handle rendering own schedule type's errors;
    [x] For each custom hook's state's shippingSchedules' object, render a card with datatable;
    [x] Invoke component in view;
