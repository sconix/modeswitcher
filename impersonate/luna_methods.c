/*=============================================================================
 Copyright (C) 2010 WebOS Internals <support@webos-internals.org>

 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 =============================================================================*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <pthread.h>
#include <syslog.h>
#include <sys/stat.h>

#include "luna_service.h"
#include "luna_methods.h"

//
// Handler for the system_call service.
//

bool system_call_handler(LSHandle* lshandle, LSMessage *reply, void *ctx) {
  bool retVal;
  LSError lserror;
  LSErrorInit(&lserror);
  LSMessage* message = (LSMessage*)ctx;
  retVal = LSMessageRespond(message, LSMessageGetPayload(reply), &lserror);
  LSMessageUnref(message);
  if (!retVal) {
    LSErrorPrint(&lserror, stderr);
    LSErrorFree(&lserror);
  }
  return retVal;
}

//
// system_call a call to the requested service and return the output to webOS.
//
bool system_call_method(LSHandle* lshandle, LSMessage *message, void *ctx) {
  bool retVal;
  LSError lserror;
  LSErrorInit(&lserror);
  LSMessageRef(message);

  // Extract the method argument from the message
  json_t *object = json_parse_document(LSMessageGetPayload(message));
  json_t *id = json_find_first_label(object, "id");               
  if (!id || (id->child->type != JSON_STRING)) {
    if (!LSMessageReply(lshandle, message,
			"{\"returnValue\": false, \"errorCode\": -1, \"errorText\": \"Invalid or missing id\"}",
			&lserror)) goto error;
    return true;
  }

  // Extract the service argument from the message
  object = json_parse_document(LSMessageGetPayload(message));
  json_t *service = json_find_first_label(object, "service");               
  if (!service || (service->child->type != JSON_STRING)) {
    if (!LSMessageReply(lshandle, message,
			"{\"returnValue\": false, \"errorCode\": -1, \"errorText\": \"Invalid or missing service\"}",
			&lserror)) goto error;
    return true;
  }

  // Extract the method argument from the message
  object = json_parse_document(LSMessageGetPayload(message));
  json_t *method = json_find_first_label(object, "method");               
  if (!method || (method->child->type != JSON_STRING)) {
    if (!LSMessageReply(lshandle, message,
			"{\"returnValue\": false, \"errorCode\": -1, \"errorText\": \"Invalid or missing method\"}",
			&lserror)) goto error;
    return true;
  }

  // Extract the params argument from the message
  object = json_parse_document(LSMessageGetPayload(message));
  json_t *params = json_find_first_label(object, "params");               
  if (!params || (params->child->type != JSON_OBJECT)) {
    if (!LSMessageReply(lshandle, message,
			"{\"returnValue\": false, \"errorCode\": -1, \"errorText\": \"Invalid or missing params\"}",
			&lserror)) goto error;
    return true;
  }

  char uri[MAXLINLEN];
  sprintf(uri, "palm://%s/%s", service->child->text, method->child->text);

  char *paramstring = NULL;
  json_tree_to_string (params->child, &paramstring);
  if (!LSCallFromApplication(priv_serviceHandle, uri, paramstring, id->child->text,
			     system_call_handler, message, NULL, &lserror)) goto error;

  return true;
 error:
  LSErrorPrint(&lserror, stderr);
  LSErrorFree(&lserror);
 end:
  return false;
}

LSMethod luna_methods[] = {
  { "systemCall",		system_call_method },
  { 0, 0 }
};

bool register_methods(LSPalmService *serviceHandle, LSError lserror) {
  return LSPalmServiceRegisterCategory(serviceHandle, "/", luna_methods, luna_methods,
				       NULL, NULL, &lserror);
}

