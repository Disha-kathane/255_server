let async = require('async');
let mysql = require('../database/db');
const Queue = require('bull');
const Redis = require('ioredis');
const semaphore = require('semaphore');
const sem = semaphore(1);
const redis = new Redis({
    redis: {
        host: '0.0.0.0',
        port: 6379
    }
});
const { errorLogger, infoLogger } = require('../applogger');

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


module.exports.createpayload = async (mid, TPS_Payload, contactno) => {
    let limits = {
        redis: redis,
        limiter: {
            max: TPS_Payload,
            duration: 1000,
            bounceBack: false
        }
    };

    // let threadsqueue = new Queue(contactno, limits);
    const threadsqueue = new Queue('QUEUE-1', limits);

    console.log('LIMITS ===============>' + JSON.stringify(limits.limiter));
    let temid = [];

    for (let j = 0; j < mid.length; j++) {

        console.log(' j ============>' + [j]);

        mid[j].mobileno = mid[j].mobileno.replace(/\+/g, '');
        mid[j].mobileno = mid[j].mobileno.replace(/\'/g, '');
        mid[j].mobileno = mid[j].mobileno.replace(/\ /g, '');
        mid[j].mobileno = mid[j].mobileno.replace(/\-/g, '');
        mid[j].mobileno = mid[j].mobileno.replace(/\//g, '');


        let status = null;
        let errormessage = null;
        let errorCode = null;
        let errorDesc = null;
        let direction = 1;
        let wabaCountryCode = null;
        let wabaCountryCodeNumeric = null;
        let notificationRate = null;
        let feedbackRate = null;
        let responseRate = null;
        let submissiontype = "NOTIFICATION";
        let bodyContent = null;
        let objMsg = null;
        let waMessageId = null;
        let fbtrace_id = null;
        let subflagparameter = null;

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

                    if (mid[j].button_option == 0 && mid[j].button_option != '') {
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

                    if (mid[j].button_option == 1 && mid[j].button_option != '') {
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

                    if (mid[j].button_option == 0 && mid[j].button_option != '') {
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
                    if (mid[j].button_option == 1 && mid[j].button_option != '') {
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
                    if (mid[j].button_option == 0 && mid[j].button_option != '') {
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
                    if (mid[j].button_option == 1 && mid[j].button_option != '') {
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

                    if (mid[j].button_option == 0 && mid[j].button_option != '') {
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

                    if (mid[j].button_option == 1 && mid[j].button_option != '') {
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

                    if (mid[j].button_option == 0 && mid[j].button_option != '') {
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
                    if (mid[j].button_option == 1 && mid[j].button_option != '') {
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
                    if (mid[j].button_option == 0 && mid[j].button_option != '') {
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
                    if (mid[j].button_option == 1 && mid[j].button_option != '') {
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

                        if (mid[j].button_option == 0 && mid[j].button_option != '') {
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
                        if (mid[j].button_option == 1 && mid[j].button_option != '') {
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
                        if (mid[j].button_option == 0 && mid[j].button_option != '') {
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
                        if (mid[j].button_option == 1 && mid[j].button_option != '') {
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



        query = "SELECT subflag FROM ezb_subscription_master WHERE wanumber = ? AND wabanumber = ?";
        subflagparameter = await mysql.query(query, [mid[j].mobileno, mid[j].contactno]);
        // console.log('subflagparameter====================>' + JSON.stringify(subflagparameter));
        errorLogger.info('SUBFLAGPARAMETER =====================>' + JSON.stringify(subflagparameter));

        if (subflagparameter != undefined && subflagparameter.length > 0 && subflagparameter[0][0] != undefined && subflagparameter[0][0].subflag == 0) {
            errorLogger.info('OBJMESSAGE_1 =====================>' + JSON.stringify(objMsg));
            let bodyContent = mid[j].bodyContent;
            errorCode = 120100;
            errorDesc = 'No subscription found for the mobile number ' + mid[j].mobileno;

            query = "INSERT INTO ezb_message_sent_master(requestid,botid,userid,mobileno,wabapayload,messageid,errcode,errdesc,createdt,appid,status,readstatus,messagetype,campaignid,contactno,msg_setting_id,direction,body_content,sentdt,submissiontype,countrycode,rate,fbtrace_id,subscriberid,retrycount)" +
                " VALUES(?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?)";
            let insertsentmaster_1 = await mysql.query(query, [mid[j].id, mid[j].botid, mid[j].userid, mid[j].mobileno, JSON.stringify(objMsg), waMessageId, errorCode, errorDesc, mid[j].appid, 0, 0, mid[j].messagetype, mid[j].campaignid, mid[j].contactno, mid[j].msg_setting_id, direction, bodyContent, submissiontype, wabaCountryCodeNumeric, notificationRate, fbtrace_id, mid[j].subscriberid, mid[j].retrycount]);
            console.log('insertsentmaster_1 ====================>' + insertsentmaster_1);
            errorLogger.info('INSERTSENTMASTER_1 =====================>' + JSON.stringify(insertsentmaster_1));


        } else {
            let tempobj = {
                objMsg: objMsg,
                bodyContent: bodyContent,
                mid: mid[j],
                // subflagparameter: subflagparameter[0][0] != undefined ? subflagparameter[0][0].subflag : 1,
                TPS_Payload: TPS_Payload
            };

            threadsqueue.add(tempobj).then((job) => {
                console.log('Added to Queue');
                console.log(' JOBS ======================>' + JSON.stringify(job.id));
            });
        }

        temid.push(mid[j].id);
        if (j == mid.length - 1) {
            // console.log('temid ==========>'(temid.length));
            // await redis.quit();
            return temid;
        }

        // query = "DELETE FROM ezb_message_request_master_87396 where id IN (?)";
        // let deleteid = await mysql.query(query, [mid[j].id]);
        // console.log('deleteid ==========>' + JSON.stringify(deleteid));
    }

};
