APP_ID = org.e.lnx.wee.modeswitcher

APP_DIR = /usr/palm/applications/$(APP_ID)

PKG_DIR = /usr/palm/packages/$(APP_ID)

SRV_DIR = /usr/palm/services/$(APP_ID).srv

SYS_DIR = /usr/palm/services/$(APP_ID).sys

all: clean
	@mkdir -p ./build/$(APP_DIR)
	@mkdir -p ./build/$(PKG_DIR)
	@mkdir -p ./build/$(SRV_DIR)
	@mkdir -p ./build/$(SYS_DIR)
	@cp -a mojo-app/* ./build/$(APP_DIR)/
	@cp -a package/* ./build/$(PKG_DIR)/
	@cp -a node-service/* ./build/$(SRV_DIR)/
	@cp ./impersonate/org* ./build/$(SYS_DIR)/
	@cp ./impersonate/impersonate_armv7 ./build/$(SYS_DIR)/impersonate
	@wosi-package -p ./build

install: all
	palm-install ${APP_ID}_*.ipk
	palm-launch ${APP_ID}

clean:
	@rm -rf ./build
	@mkdir ./build
	@echo "*" >./build/.gitignore
