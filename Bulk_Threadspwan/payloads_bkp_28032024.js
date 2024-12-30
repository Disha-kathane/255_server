
function fetchPlaceholders(placeholders) {
    var placeholderArr = JSON.parse(placeholders);
    var tempArr = [];
    for (var i = 0; i < placeholderArr.length; i++) {
        tempArr.push({
            "type": "text",
            "text": placeholderArr[i] != null ? placeholderArr[i].toString() : ''
        });
    }

    return tempArr;
}


module.exports.createpayload = (mid) => {

    let temppayload = [];

    for (let j = 0; j < mid.length; j++) {

        // console.log('mid j ============>' + JSON.stringify(mid[j]));
        // console.log('mid location ============>' + mid[j].location_placeholder);

        // console.log('buttonopt mid ============>' +JSON.parse(mid[j].button_option_string)[0].visit_website.web_url_option);
        // JSON.parse(mid[j].button_option_string)


        mid[j].mobileno = mid[j].mobileno.replace(/\+/g, '');
        mid[j].mobileno = mid[j].mobileno.replace(/\'/g, '');
        mid[j].mobileno = mid[j].mobileno.replace(/\ /g, '');
        mid[j].mobileno = mid[j].mobileno.replace(/\-/g, '');
        mid[j].mobileno = mid[j].mobileno.replace(/\//g, '');

        let bodyContent = null;
        let objMsg = null;
        let waMessageId = null;
        let fbtrace_id = null;



        if (mid[j].placeholders != null) {
            let _x = mid[j].placeholders.toString().indexOf("'[");
            if (_x == 0) {
                mid[j].placeholders = mid[j].placeholders.toString().replace("'[", "[");
            }

            _x = mid[j].placeholders.toString().lastIndexOf("]'");
            if (_x != -1) {
                mid[j].placeholders = mid[j].placeholders.toString().replace("]'", "]");
            }
        }


        switch (mid[j].messagetype) {

            case 0: // DOCUMENT
                if (mid[j].mediaflag == 1) {
                    if (mid[j].placeholders != '' && Array.isArray(JSON.parse(mid[j].placeholders))) {
                        let tempArr = fetchPlaceholders(mid[j].placeholders);

                        let i = 1;
                        bodyContent = mid[j].body_message.toString();
                        for (let j = 0; j < tempArr.length; j++) {
                            let x = tempArr[j].text;
                            //console.log(x, '{{' + i + '}}');
                            bodyContent = bodyContent.replace('{{' + i + '}}', x);
                            i++;
                        }

                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    //"policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": [{
                                    "type": "header",
                                    "parameters": [{
                                        "type": "document",
                                        "document": {
                                            "id": mid[j].media,
                                            "caption": "",
                                            "filename": mid[j].filename
                                        }
                                    }]
                                },
                                {
                                    "type": "body",
                                    "parameters": tempArr
                                }
                                ]
                            }
                        };
                    } else {
                        bodyContent = mid[j].body_message.toString();
                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    //  "policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": [{
                                    "type": "header",
                                    "parameters": [{
                                        "type": "document",
                                        "document": {
                                            "id": mid[j].media,
                                            "caption": "",
                                            "filename": mid[j].filename
                                        }
                                    }]
                                }]
                            }
                        };
                    }

                    if (mid[j].button_option == 0 && mid[j].button_option != '' && mid[j].button_option_string != '' && mid[j].button_option_string.length > 0) {
                        let callToActionArr = JSON.parse(mid[j].button_option_string);
                        for (let i = 0; i < callToActionArr.length; ++i) {
                            if (mid[j].dynamic_url_placeholder.length > 0) {
                                if (callToActionArr[i].visit_website != null && callToActionArr[i].visit_website != undefined) {
                                    let tempArr = [];
                                    let component_button = {
                                        "type": "button",
                                        "sub_type": "url",
                                        "index": i,
                                        "parameters": tempArr
                                    };
                                    tempArr.push({
                                        "type": "text",
                                        "text": mid[j].dynamic_url_placeholder
                                    });

                                    component_button.parameters = tempArr;
                                    objMsg.template.components.push(component_button);
                                }
                            }
                        }
                    }

                    if (mid[j].button_option == 1 && mid[j].button_option != '' && mid[j].button_option_string != '' && mid[j].button_option_string.length > 0) {
                        let quickReplyArr = JSON.parse(mid[j].button_option_string);

                        for (let i = 0; i < quickReplyArr.length; ++i) {
                            let tempArr = [];
                            let component_button = {
                                "type": "button",
                                "sub_type": "quick_reply",
                                "index": i,
                                "parameters": tempArr
                            };
                            tempArr.push({
                                "type": "payload",
                                "payload": quickReplyArr[i].quick_reply
                            });
                            component_button.parameters = tempArr;
                            objMsg.template.components.push(component_button);
                        }
                    }
                }
                if (mid[j].mediaflag == 2) {
                    if (mid[j].placeholders != '' && Array.isArray(JSON.parse(mid[j].placeholders))) {
                        let tempArr = fetchPlaceholders(mid[j].placeholders);
                        let i = 1;
                        bodyContent = mid[j].body_message.toString();
                        for (let j = 0; j < tempArr.length; j++) {
                            let x = tempArr[j].text;
                            //console.log(x, '{{' + i + '}}');
                            bodyContent = bodyContent.replace('{{' + i + '}}', x);
                            i++;
                        }

                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    //"policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": [{
                                    "type": "header",
                                    "parameters": [{
                                        "type": "document",
                                        "document": {
                                            "link": mid[j].media,
                                            "caption": "",
                                            "filename": mid[j].filename
                                        }
                                    }]
                                },
                                {
                                    "type": "body",
                                    "parameters": tempArr
                                }
                                ]
                            }
                        };
                    } else {
                        bodyContent = mid[j].body_message.toString();
                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    //"policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": [{
                                    "type": "header",
                                    "parameters": [{
                                        "type": "document",
                                        "document": {
                                            "link": mid[j].media,
                                            "caption": "",
                                            "filename": mid[j].filename
                                        }
                                    }]
                                }]
                            }
                        };
                    }

                    if (mid[j].button_option == 0 && mid[j].button_option != '' && mid[j].button_option_string != '' && mid[j].button_option_string.length > 0) {
                        let callToActionArr = JSON.parse(mid[j].button_option_string);
                        for (let i = 0; i < callToActionArr.length; ++i) {
                            if (mid[j].dynamic_url_placeholder.length > 0) {
                                if (callToActionArr[i].visit_website != null && callToActionArr[i].visit_website != undefined) {
                                    let tempArr = [];
                                    let component_button = {
                                        "type": "button",
                                        "sub_type": "url",
                                        "index": i,
                                        "parameters": tempArr
                                    };
                                    tempArr.push({
                                        "type": "text",
                                        "text": mid[j].dynamic_url_placeholder
                                    });

                                    component_button.parameters = tempArr;
                                    objMsg.template.components.push(component_button);
                                }
                            }
                        }
                    }
                    if (mid[j].button_option == 1 && mid[j].button_option != '' && mid[j].button_option_string != '' && mid[j].button_option_string.length > 0) {
                        let quickReplyArr = JSON.parse(mid[j].button_option_string);

                        for (let i = 0; i < quickReplyArr.length; ++i) {
                            let tempArr = [];
                            let component_button = {
                                "type": "button",
                                "sub_type": "quick_reply",
                                "index": i,
                                "parameters": tempArr
                            };
                            tempArr.push({
                                "type": "payload",
                                "payload": quickReplyArr[i].quick_reply
                            });
                            component_button.parameters = tempArr;
                            objMsg.template.components.push(component_button);
                        }
                    }
                }
                break;
            case 1: // IMAGE

                if (mid[j].mediaflag == 1) {
                    if (mid[j].placeholders != '' && Array.isArray(JSON.parse(mid[j].placeholders))) {
                        let tempArr = fetchPlaceholders(mid[j].placeholders);

                        let i = 1;
                        bodyContent = mid[j].body_message.toString();
                        for (let j = 0; j < tempArr.length; j++) {
                            let x = tempArr[j].text;
                            //console.log(x, '{{' + i + '}}');
                            bodyContent = bodyContent.replace('{{' + i + '}}', x);
                            i++;
                        }

                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    //"policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": [{
                                    "type": "header",
                                    "parameters": [{
                                        "type": "image",
                                        "image": {
                                            "id": mid[j].media,
                                            "caption": ""
                                            // "filename": mid[j].filename
                                        }
                                    }]
                                },
                                {
                                    "type": "body",
                                    "parameters": tempArr
                                }
                                ]
                            }
                        };

                    } else {
                        bodyContent = mid[j].body_message.toString();
                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    //"policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": [{
                                    "type": "header",
                                    "parameters": [{
                                        "type": "image",
                                        "image": {
                                            "id": mid[j].media,
                                            "caption": ""
                                            //"filename": mid[j].filename
                                        }
                                    }]
                                }]
                            }
                        };
                    }
                    if (mid[j].button_option == 0 && mid[j].button_option != '' && mid[j].button_option_string != '' && mid[j].button_option_string.length > 0) {
                        let callToActionArr = JSON.parse(mid[j].button_option_string);
                        for (let i = 0; i < callToActionArr.length; ++i) {
                            if (mid[j].dynamic_url_placeholder.length > 0) {
                                if (callToActionArr[i].visit_website != null && callToActionArr[i].visit_website != undefined) {
                                    let tempArr = [];
                                    let component_button = {
                                        "type": "button",
                                        "sub_type": "url",
                                        "index": i,
                                        "parameters": tempArr
                                    };
                                    tempArr.push({
                                        "type": "text",
                                        "text": mid[j].dynamic_url_placeholder
                                    });

                                    component_button.parameters = tempArr;
                                    objMsg.template.components.push(component_button);
                                }
                            }
                        }
                    }
                    if (mid[j].button_option == 1 && mid[j].button_option != '' && mid[j].button_option_string != '' && mid[j].button_option_string.length > 0) {
                        let quickReplyArr = JSON.parse(mid[j].button_option_string);

                        for (let i = 0; i < quickReplyArr.length; ++i) {
                            let tempArr = [];
                            let component_button = {
                                "type": "button",
                                "sub_type": "quick_reply",
                                "index": i,
                                "parameters": tempArr
                            };
                            tempArr.push({
                                "type": "payload",
                                "payload": quickReplyArr[i].quick_reply
                            });
                            component_button.parameters = tempArr;
                            objMsg.template.components.push(component_button);
                        }
                    }
                }
                if (mid[j].mediaflag == 2) {
                    if (mid[j].placeholders != '' && Array.isArray(JSON.parse(mid[j].placeholders))) {
                        let tempArr = fetchPlaceholders(mid[j].placeholders);
                        let i = 1;
                        bodyContent = mid[j].body_message.toString();
                        for (let j = 0; j < tempArr.length; j++) {
                            let x = tempArr[j].text;
                            //console.log(x, '{{' + i + '}}');
                            bodyContent = bodyContent.replace('{{' + i + '}}', x);
                            i++;
                        }

                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    //"policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": [{
                                    "type": "header",
                                    "parameters": [{
                                        "type": "image",
                                        "image": {
                                            "link": mid[j].media,
                                            "caption": ""
                                            // "filename": mid[j].filename
                                        }
                                    }]
                                },
                                {
                                    "type": "body",
                                    "parameters": tempArr
                                }
                                ]
                            }
                        };
                    } else {
                        bodyContent = mid[j].body_message.toString();
                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    // "policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": [{
                                    "type": "header",
                                    "parameters": [{
                                        "type": "image",
                                        "image": {
                                            "link": mid[j].media,
                                            "caption": ""
                                            //"filename": mid[j].filename
                                        }
                                    }]
                                }]
                            }
                        };
                    }

                    if (mid[j].button_option == 0 && mid[j].button_option != '' && mid[j].button_option_string != '' && mid[j].button_option_string.length > 0) {
                        let callToActionArr = JSON.parse(mid[j].button_option_string);
                        for (let i = 0; i < callToActionArr.length; ++i) {
                            if (mid[j].dynamic_url_placeholder.length > 0) {
                                if (callToActionArr[i].visit_website != null && callToActionArr[i].visit_website != undefined) {
                                    let tempArr = [];
                                    let component_button = {
                                        "type": "button",
                                        "sub_type": "url",
                                        "index": i,
                                        "parameters": tempArr
                                    };
                                    tempArr.push({
                                        "type": "text",
                                        "text": mid[j].dynamic_url_placeholder
                                    });

                                    component_button.parameters = tempArr;
                                    objMsg.template.components.push(component_button);
                                }
                            }
                        }
                    }

                    if (mid[j].button_option == 1 && mid[j].button_option != '' && mid[j].button_option_string != '' && mid[j].button_option_string.length > 0) {
                        let quickReplyArr = JSON.parse(mid[j].button_option_string);

                        for (let i = 0; i < quickReplyArr.length; ++i) {
                            let tempArr = [];
                            let component_button = {
                                "type": "button",
                                "sub_type": "quick_reply",
                                "index": i,
                                "parameters": tempArr
                            };
                            tempArr.push({
                                "type": "payload",
                                "payload": quickReplyArr[i].quick_reply
                            });
                            component_button.parameters = tempArr;
                            objMsg.template.components.push(component_button);
                        }
                    }
                }
                break;
            case 2: // VIDEO

                if (mid[j].mediaflag == 1) {
                    if (mid[j].placeholders != '' && Array.isArray(JSON.parse(mid[j].placeholders))) {
                        let tempArr = fetchPlaceholders(mid[j].placeholders);

                        let i = 1;
                        bodyContent = mid[j].body_message.toString();
                        for (let j = 0; j < tempArr.length; j++) {
                            let x = tempArr[j].text;
                            //console.log(x, '{{' + i + '}}');
                            bodyContent = bodyContent.replace('{{' + i + '}}', x);
                            i++;

                        }
                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    // "policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": [{
                                    "type": "header",
                                    "parameters": [{
                                        "type": "video",
                                        "video": {
                                            "id": mid[j].media
                                            // "filename": mid[j].filename
                                        }
                                    }]
                                },
                                {
                                    "type": "body",
                                    "parameters": tempArr
                                }
                                ]
                            }
                        };
                    } else {
                        bodyContent = mid[j].body_message.toString();
                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    //"policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": [{
                                    "type": "header",
                                    "parameters": [{
                                        "type": "video",
                                        "video": {
                                            "id": mid[j].media
                                            //"filename": mid[j].filename
                                        }
                                    }]
                                }]
                            }
                        };
                    }

                    if (mid[j].button_option == 0 && mid[j].button_option != '' && mid[j].button_option_string != '' && mid[j].button_option_string.length > 0) {
                        let callToActionArr = JSON.parse(mid[j].button_option_string);
                        for (let i = 0; i < callToActionArr.length; ++i) {
                            if (mid[j].dynamic_url_placeholder.length > 0) {
                                if (callToActionArr[i].visit_website != null && callToActionArr[i].visit_website != undefined) {
                                    let tempArr = [];
                                    let component_button = {
                                        "type": "button",
                                        "sub_type": "url",
                                        "index": i,
                                        "parameters": tempArr
                                    };
                                    tempArr.push({
                                        "type": "text",
                                        "text": mid[j].dynamic_url_placeholder
                                    });

                                    component_button.parameters = tempArr;
                                    objMsg.template.components.push(component_button);
                                }
                            }
                        }
                    }
                    if (mid[j].button_option == 1 && mid[j].button_option != '' && mid[j].button_option_string != '' && mid[j].button_option_string.length > 0) {
                        let quickReplyArr = JSON.parse(mid[j].button_option_string);

                        for (let i = 0; i < quickReplyArr.length; ++i) {
                            let tempArr = [];
                            let component_button = {
                                "type": "button",
                                "sub_type": "quick_reply",
                                "index": i,
                                "parameters": tempArr
                            };
                            tempArr.push({
                                "type": "payload",
                                "payload": quickReplyArr[i].quick_reply
                            });
                            component_button.parameters = tempArr;
                            objMsg.template.components.push(component_button);
                        }
                    }
                }
                if (mid[j].mediaflag == 2) {
                    if (mid[j].placeholders != '' && Array.isArray(JSON.parse(mid[j].placeholders))) {
                        let tempArr = fetchPlaceholders(mid[j].placeholders);
                        let i = 1;
                        bodyContent = mid[j].body_message.toString();
                        for (let j = 0; j < tempArr.length; j++) {
                            let x = tempArr[j].text;
                            //console.log(x, '{{' + i + '}}');
                            bodyContent = bodyContent.replace('{{' + i + '}}', x);
                            i++;
                        }

                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    //"policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": [{
                                    "type": "header",
                                    "parameters": [{
                                        "type": "video",
                                        "video": {
                                            "link": mid[j].media
                                            // "filename": mid[j].filename
                                        }
                                    }]
                                },
                                {
                                    "type": "body",
                                    "parameters": tempArr
                                }
                                ]
                            }
                        };
                    } else {
                        bodyContent = mid[j].body_message.toString();
                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    //"policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": [{
                                    "type": "header",
                                    "parameters": [{
                                        "type": "video",
                                        "video": {
                                            "link": mid[j].media
                                            // "filename": mid[j].filename
                                        }
                                    }]
                                }]
                            }
                        };
                    }
                    if (mid[j].button_option == 0 && mid[j].button_option != '' && mid[j].button_option_string != '' && mid[j].button_option_string.length > 0) {
                        let callToActionArr = JSON.parse(mid[j].button_option_string);
                        for (let i = 0; i < callToActionArr.length; ++i) {
                            if (mid[j].dynamic_url_placeholder.length > 0) {
                                if (callToActionArr[i].visit_website != null && callToActionArr[i].visit_website != undefined) {
                                    let tempArr = [];
                                    let component_button = {
                                        "type": "button",
                                        "sub_type": "url",
                                        "index": i,
                                        "parameters": tempArr
                                    };
                                    tempArr.push({
                                        "type": "text",
                                        "text": mid[j].dynamic_url_placeholder
                                    });

                                    component_button.parameters = tempArr;
                                    objMsg.template.components.push(component_button);
                                }
                            }
                        }
                    }
                    if (mid[j].button_option == 1 && mid[j].button_option != '' && mid[j].button_option_string != '' && mid[j].button_option_string.length > 0) {
                        let quickReplyArr = JSON.parse(mid[j].button_option_string);

                        for (let i = 0; i < quickReplyArr.length; ++i) {
                            let tempArr = [];
                            let component_button = {
                                "type": "button",
                                "sub_type": "quick_reply",
                                "index": i,
                                "parameters": tempArr
                            };
                            tempArr.push({
                                "type": "payload",
                                "payload": quickReplyArr[i].quick_reply
                            });
                            component_button.parameters = tempArr;
                            objMsg.template.components.push(component_button);
                        }
                    }
                }
                break;
            case 4: //TEXT MESSAGE

                if (mid[j].mediaflag == 0) {
                    if (mid[j].placeholders != '' && Array.isArray(JSON.parse(mid[j].placeholders))) {
                        let tempArr = fetchPlaceholders(mid[j].placeholders);

                        let i = 1;
                        bodyContent = mid[j].body_message.toString();
                        for (let j = 0; j < tempArr.length; j++) {
                            let x = tempArr[j].text;
                            //console.log(x, '{{' + i + '}}');
                            bodyContent = bodyContent.replace('{{' + i + '}}', x);
                            i++;
                        }

                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    //"policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": [{
                                    "type": "body",
                                    "parameters": tempArr
                                }]
                            }
                        };
                    } else {
                        bodyContent = mid[j].body_message.toString();
                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    //"policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": []
                            }
                        };
                    }
                    if (mid[j].placeholder_template_type == 1) {
                        let tmpHeader = {
                            "type": "header",
                            "parameters": [{
                                "type": "text",
                                "text": mid[j].header_placeholder
                            }]
                        };

                        if (mid[j].button_option == 0 && mid[j].button_option != '' && mid[j].button_option_string != '' && mid[j].button_option_string.length > 0) {
                            let callToActionArr = JSON.parse(mid[j].button_option_string);
                            for (let i = 0; i < callToActionArr.length; ++i) {
                                if (mid[j].dynamic_url_placeholder.length > 0) {
                                    if (callToActionArr[i].visit_website != null && callToActionArr[i].visit_website != undefined) {
                                        let tempArr = [];
                                        let component_button = {
                                            "type": "button",
                                            "sub_type": "url",
                                            "index": i,
                                            "parameters": tempArr
                                        };
                                        tempArr.push({
                                            "type": "text",
                                            "text": mid[j].dynamic_url_placeholder
                                        });

                                        component_button.parameters = tempArr;
                                        objMsg.template.components.push(component_button);
                                    }
                                }
                            }
                        }
                        if (mid[j].button_option == 1 && mid[j].button_option != '' && mid[j].button_option_string != '' && mid[j].button_option_string.length > 0) {
                            let quickReplyArr = JSON.parse(mid[j].button_option_string);

                            for (let i = 0; i < quickReplyArr.length; ++i) {
                                let tempArr = [];
                                let component_button = {
                                    "type": "button",
                                    "sub_type": "quick_reply",
                                    "index": i,
                                    "parameters": tempArr
                                };
                                tempArr.push({
                                    "type": "payload",
                                    "payload": quickReplyArr[i].quick_reply
                                });
                                component_button.parameters = tempArr;
                                objMsg.template.components.push(component_button);
                            }
                        }
                        objMsg.template.components.push(tmpHeader);
                    }
                    if (mid[j].placeholder_template_type == 2) {
                        let tmpHeader = {
                            "type": "header",
                            "parameters": [{
                                "type": "text",
                                "text": mid[j].header_placeholder
                            }]
                        };

                        objMsg.template.components.push(tmpHeader);
                    }
                    if (mid[j].placeholder_template_type == 4) {
                        if (mid[j].button_option == 0 && mid[j].button_option != '' && mid[j].button_option_string != '' && mid[j].button_option_string.length > 0) {
                            let callToActionArr = JSON.parse(mid[j].button_option_string);
                            for (let i = 0; i < callToActionArr.length; ++i) {
                                if (mid[j].dynamic_url_placeholder.length > 0) {
                                    if (callToActionArr[i].visit_website != null && callToActionArr[i].visit_website != undefined) {
                                        let tempArr = [];
                                        let component_button = {
                                            "type": "button",
                                            "sub_type": "url",
                                            "index": i,
                                            "parameters": tempArr
                                        };
                                        tempArr.push({
                                            "type": "text",
                                            "text": mid[j].dynamic_url_placeholder
                                        });

                                        component_button.parameters = tempArr;
                                        objMsg.template.components.push(component_button);
                                    }
                                }
                            }
                        }
                        if (mid[j].button_option == 1 && mid[j].button_option != '' && mid[j].button_option_string != '' && mid[j].button_option_string.length > 0) {
                            let quickReplyArr = JSON.parse(mid[j].button_option_string);

                            for (let i = 0; i < quickReplyArr.length; ++i) {
                                let tempArr = [];
                                let component_button = {
                                    "type": "button",
                                    "sub_type": "quick_reply",
                                    "index": i,
                                    "parameters": tempArr
                                };
                                tempArr.push({
                                    "type": "payload",
                                    "payload": quickReplyArr[i].quick_reply
                                });
                                component_button.parameters = tempArr;
                                objMsg.template.components.push(component_button);
                            }
                        }
                    }
                }
                break;
            case 5: //LOCATION
                console.log(mid[j]);
                let location = null;
                let latitude = null;
                let longitude = null;
                let locationname = null;
                let locationaddress = null;
                if (mid[j].location_placeholder != null && mid[j].location_placeholder.length > 0) {
                    let _x = mid[j].location_placeholder.toString().indexOf("'[");
                    if (_x == 0) {
                        mid[j].location_placeholder = mid[j].location_placeholder.toString().replace("'[", "[");
                    }

                    _x = mid[j].location_placeholder.toString().lastIndexOf("]'");
                    if (_x != -1) {
                        mid[j].location_placeholder = mid[j].location_placeholder.toString().replace("]'", "]");
                    }

                    location = JSON.parse(mid[j].location_placeholder);
                    latitude = location.latitude;
                    longitude = location.longitude;
                    locationname = location.name;
                    locationaddress = location.address;
                }

                // let location = JSON.parse(mid[j].location_placeholder);
                // let latitude = location[0];
                // let longitude = location[1];
                // let locationname = location[2];
                // let locationaddress = location[3];
                console.log({ location });
                console.log({ latitude });
                console.log({ longitude });
                console.log({ locationname });
                console.log({ locationaddress });


                if (mid[j].mediaflag == 0) {
                    if (mid[j].placeholders != '' && Array.isArray(JSON.parse(mid[j].placeholders))) {
                        let tempArr = fetchPlaceholders(mid[j].placeholders);

                        let i = 1;
                        bodyContent = mid[j].body_message.toString();
                        for (let j = 0; j < tempArr.length; j++) {
                            let x = tempArr[j].text;
                            //console.log(x, '{{' + i + '}}');
                            bodyContent = bodyContent.replace('{{' + i + '}}', x);
                            i++;
                        }

                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    //"policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": [{
                                    "type": "body",
                                    "parameters": tempArr
                                }]
                            }
                        };
                    } else {
                        bodyContent = mid[j].body_message.toString();
                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    //"policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": []
                            }
                        };
                    }
                    if (mid[j].placeholder_template_type == 1) {
                        let tmpHeader = {
                            "type": "header",
                            "parameters": [{
                                "type": "location",
                                "location": {
                                    "latitude": latitude,
                                    "longitude": longitude,
                                    "name": locationname,
                                    "address": locationaddress
                                }
                            }]
                        };

                        if (mid[j].button_option == 0 && mid[j].button_option != '' && mid[j].button_option_string != '' && mid[j].button_option_string.length > 0) {
                            let callToActionArr = JSON.parse(mid[j].button_option_string);
                            for (let i = 0; i < callToActionArr.length; ++i) {
                                if (mid[j].dynamic_url_placeholder.length > 0) {
                                    if (callToActionArr[i].visit_website != null && callToActionArr[i].visit_website != undefined) {
                                        let tempArr = [];
                                        let component_button = {
                                            "type": "button",
                                            "sub_type": "url",
                                            "index": i,
                                            "parameters": tempArr
                                        };
                                        tempArr.push({
                                            "type": "text",
                                            "text": mid[j].dynamic_url_placeholder
                                        });

                                        component_button.parameters = tempArr;
                                        objMsg.template.components.push(component_button);
                                    }
                                }
                            }
                        }
                        if (mid[j].button_option == 1 && mid[j].button_option != '' && mid[j].button_option_string != '' && mid[j].button_option_string.length > 0) {
                            let quickReplyArr = JSON.parse(mid[j].button_option_string);

                            for (let i = 0; i < quickReplyArr.length; ++i) {
                                let tempArr = [];
                                let component_button = {
                                    "type": "button",
                                    "sub_type": "quick_reply",
                                    "index": i,
                                    "parameters": tempArr
                                };
                                tempArr.push({
                                    "type": "payload",
                                    "payload": quickReplyArr[i].quick_reply
                                });
                                component_button.parameters = tempArr;
                                objMsg.template.components.push(component_button);
                            }
                        }
                        objMsg.template.components.push(tmpHeader);
                    }
                    if (mid[j].placeholder_template_type == 2 || mid[j].placeholder_template_type == 3 || mid[j].placeholder_template_type == 0 || mid[j].placeholder_template_type == 4) {
                        let tmpHeader = {
                            "type": "header",
                            "parameters": [{
                                "type": "location",
                                "location": {
                                    "latitude": latitude,
                                    "longitude": longitude,
                                    "name": locationname,
                                    "address": locationaddress
                                }
                            }]
                        };

                        objMsg.template.components.push(tmpHeader);
                    }
                    if (mid[j].placeholder_template_type == 4) {
                        if (mid[j].button_option == 0 && mid[j].button_option != '' && mid[j].button_option_string != '' && mid[j].button_option_string.length > 0) {
                            let callToActionArr = JSON.parse(mid[j].button_option_string);
                            for (let i = 0; i < callToActionArr.length; ++i) {
                                if (mid[j].dynamic_url_placeholder.length > 0) {
                                    if (callToActionArr[i].visit_website != null && callToActionArr[i].visit_website != undefined) {

                                        let tempArr = [];
                                        let component_button = {
                                            "type": "button",
                                            "sub_type": "url",
                                            "index": i,
                                            "parameters": tempArr
                                        };
                                        tempArr.push({
                                            "type": "text",
                                            "text": mid[j].dynamic_url_placeholder
                                        });

                                        component_button.parameters = tempArr;
                                        objMsg.template.components.push(component_button);
                                        // console.log('component_button ==============>' + JSON.stringify(component_button));
                                        // console.log('tempArr ==============>' + JSON.stringify(tempArr));
                                    }
                                }
                            }
                        }
                        if (mid[j].button_option == 1 && mid[j].button_option != '' && mid[j].button_option_string != '' && mid[j].button_option_string.length > 0) {
                            let quickReplyArr = JSON.parse(mid[j].button_option_string);

                            for (let i = 0; i < quickReplyArr.length; ++i) {
                                let tempArr = [];
                                let component_button = {
                                    "type": "button",
                                    "sub_type": "quick_reply",
                                    "index": i,
                                    "parameters": tempArr
                                };
                                tempArr.push({
                                    "type": "payload",
                                    "payload": quickReplyArr[i].quick_reply
                                });
                                component_button.parameters = tempArr;
                                objMsg.template.components.push(component_button);
                            }
                        }
                    }
                }
                break;

        }

        let tempobj = {
            objMsg: objMsg,
            bodyContent: bodyContent,
            mid: mid[j]
        };

        // console.log('bodyContent ============>' + bodyContent)

        temppayload.push(tempobj);
        if (j == mid.length - 1) {
            // console.log('temppayload ==========>'+JSON.stringify(temppayload));
            return temppayload;
        }
    }
};
