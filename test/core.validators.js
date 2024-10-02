const { describe } = require("mocha");
const Validator = require("validator");
const Ajv = require("ajv");
const expect = require("chai").expect;

const runner = (validators, val, envs = {}) => {
    return () => {
        for (let { message, validator } of validators) {
            if (
                !validator(val, {
                    validator: Validator,
                    ajv: new Ajv(),
                    ...envs,
                })
            ) {
                throw new Error(message);
            }
        }
        return true;
    };
};

describe("Core Validators", () => {
    describe("Boolean", () => {
        describe("Type", () => {
            const validators = require("../src/core/validators/boolean");
            const listOfInvalidValues = {
                "not-node:value_type_is_not_boolean": [
                    undefined,
                    "",
                    "123123 123",
                    {},
                    new Date(),
                    1,
                    0,
                    -0,
                ],
            };

            Object.keys(listOfInvalidValues).forEach((error_message) => {
                listOfInvalidValues[error_message].forEach((val) => {
                    it(
                        "invalid: " + (val && val.toString && val.toString()) ||
                            typeof val,
                        () =>
                            expect(runner(validators, val)).to.throw(
                                error_message
                            )
                    );
                });
            });
            it("valid: true", () =>
                expect(runner(validators, true)()).to.be.true);
            it("valid: false", () =>
                expect(runner(validators, false)()).to.be.true);
        });

        describe("true", () => {
            const validators = require("../src/core/validators/boolean.true");
            it("valid: true", () =>
                expect(runner(validators, true)()).to.be.true);
            it("invalid: false", () =>
                expect(runner(validators, false)).to.be.throw(
                    "not-node:value_type_is_not_boolean_true"
                ));
        });

        describe("false", () => {
            const validators = require("../src/core/validators/boolean.false");
            it("invalid: true", () =>
                expect(runner(validators, true)).to.be.throw(
                    "not-node:value_type_is_not_boolean_false"
                ));
            it("valid: false", () =>
                expect(runner(validators, false)()).to.be.true);
        });
    });

    describe("Date", () => {
        describe("type", () => {
            const validators = require("../src/core/validators/date");

            const listOfInvalidValues = {
                "not-node:value_type_is_not_date": [
                    undefined,
                    true,
                    false,
                    {},
                    1,
                    0,
                    -0,
                    [],
                    "connichiwa",
                ],
            };

            Object.keys(listOfInvalidValues).forEach((error_message) => {
                listOfInvalidValues[error_message].forEach((val) => {
                    it(
                        "invalid: " + (val && val.toString && val.toString()) ||
                            typeof val,
                        () =>
                            expect(
                                runner(validators, val, {
                                    validator: Validator,
                                })
                            ).to.throw(error_message)
                    );
                });
            });

            it(
                "valid: " + new Date().toString(),
                () =>
                    expect(
                        runner(validators, new Date(), {
                            validator: Validator,
                        })()
                    ).to.be.true
            );
            it(
                "valid: " + new Date().toISOString(),
                () =>
                    expect(
                        runner(validators, new Date().toISOString(), {
                            validator: Validator,
                        })()
                    ).to.be.true
            );
        });
    });

    describe("Number", () => {
        describe("type", () => {
            const validators = require("../src/core/validators/number");

            const listOfInvalidValues = {
                "not-node:value_is_not_number": [
                    undefined,
                    true,
                    false,
                    {},
                    new (class {})(),
                    "0",
                    "-0",
                    [],
                    new RegExp(""),
                ],
            };

            Object.keys(listOfInvalidValues).forEach((error_message) => {
                listOfInvalidValues[error_message].forEach((val) => {
                    it(
                        "invalid: " + (val && val.toString && val.toString()) ||
                            typeof val,
                        () =>
                            expect(
                                runner(validators, val, {
                                    validator: Validator,
                                })
                            ).to.throw(error_message)
                    );
                });
            });

            const listOfValidValues = [1, 0.0, -0.0, 1e3];
            listOfValidValues.forEach((val) => {
                it(
                    "valid: " + (val.toString && val.toString()) || typeof val,
                    () => expect(runner(validators, val)()).to.be.true
                );
            });
        });

        describe("int", () => {
            const validators = require("../src/core/validators/number.int");

            const listOfInvalidValues = {
                "not-node:value_is_not_integer": [1.1, 0.2, 1.00000000000003],
            };

            Object.keys(listOfInvalidValues).forEach((error_message) => {
                listOfInvalidValues[error_message].forEach((val) => {
                    it(
                        "invalid: " + (val && val.toString && val.toString()) ||
                            typeof val,
                        () =>
                            expect(
                                runner(validators, val, {
                                    validator: Validator,
                                })
                            ).to.throw(error_message)
                    );
                });
            });

            const listOfValidValues = [1, -90, 0, 1e3];
            listOfValidValues.forEach((val) => {
                it(
                    "valid: " + (val.toString && val.toString()) || typeof val,
                    () => expect(runner(validators, val)()).to.be.true
                );
            });
        });

        describe("positive", () => {
            const validators = require("../src/core/validators/number.positive");

            const listOfInvalidValues = {
                "not-node:value_should_be_greater_than_zero": [-1, 0, -0, +0],
            };

            Object.keys(listOfInvalidValues).forEach((error_message) => {
                listOfInvalidValues[error_message].forEach((val) => {
                    it(
                        "invalid: " + (val && val.toString && val.toString()) ||
                            typeof val,
                        () =>
                            expect(
                                runner(validators, val, {
                                    validator: Validator,
                                })
                            ).to.throw(error_message)
                    );
                });
            });

            const listOfValidValues = [1, 0.1];
            listOfValidValues.forEach((val) => {
                it(
                    "valid: " + (val.toString && val.toString()) || typeof val,
                    () => expect(runner(validators, val)()).to.be.true
                );
            });
        });
        describe("positiveOrZero", () => {
            const validators = require("../src/core/validators/number.positive.or.zero");

            const listOfInvalidValues = {
                "not-node:value_should_be_zero_or_greater": [-1],
            };

            Object.keys(listOfInvalidValues).forEach((error_message) => {
                listOfInvalidValues[error_message].forEach((val) => {
                    it(
                        "invalid: " + (val && val.toString && val.toString()) ||
                            typeof val,
                        () =>
                            expect(
                                runner(validators, val, {
                                    validator: Validator,
                                })
                            ).to.throw(error_message)
                    );
                });
            });

            const listOfValidValues = [1, 0.1, 0, +0];
            listOfValidValues.forEach((val) => {
                it(
                    "valid: " + (val.toString && val.toString()) || typeof val,
                    () => expect(runner(validators, val)()).to.be.true
                );
            });
        });
    });

    describe("Object", () => {
        describe("type", () => {
            const validators = require("../src/core/validators/object");
            const listOfInvalidValues = {
                "not-node:value_is_not_object": [
                    undefined,
                    true,
                    false,
                    1,
                    0,
                    -0,
                ],
            };

            Object.keys(listOfInvalidValues).forEach((error_message) => {
                listOfInvalidValues[error_message].forEach((val) => {
                    it(
                        "invalid: " + (val && val.toString && val.toString()) ||
                            typeof val,
                        () =>
                            expect(runner(validators, val)).to.throw(
                                error_message
                            )
                    );
                });
            });

            const listOfValidValues = [
                {},
                [],
                null,
                new Map(),
                new Date(),
                new RegExp(""),
            ];
            listOfValidValues.forEach((val) => {
                it(
                    "valid: " + (val && val.toString && val.toString()) ||
                        typeof val,
                    () => expect(runner(validators, val)()).to.be.true
                );
            });
        });
        describe("identity", () => {
            const validators = require("../src/core/validators/object.identity");
            const listOfInvalidValues = {
                "not-node:identity_object_is_not_valid": [
                    { root: null },
                    { root: true, admin: null },
                    { root: true, admin: false, auth: null },
                    {
                        root: true,
                        admin: false,
                        auth: true,
                        role: ["admin", 123],
                    },
                    { root: null },
                ],
                "not-node:identity_root_and_admin_cant_be_both_true": [
                    {
                        root: true,
                        admin: true,
                        auth: true,
                        role: ["admin"],
                        primaryRole: "admin",
                        uid: "66fd56f6608685a1486b8b29",
                        sid: "23984y5v9b201875439v20185v39",
                        provider: "SessionProvider",
                    },
                ],
                "not-node:identity_role_should_contain_primaryRole": [
                    {
                        root: false,
                        admin: false,
                        auth: true,
                        role: [],
                        primaryRole: "user",
                        uid: "66fd56f6608685a1486b8b29",
                        sid: "23984y5v9b201875439v20185v39",
                        provider: "SessionProvider",
                    },
                    {
                        root: false,
                        admin: true,
                        auth: true,
                        role: ["manager"],
                        primaryRole: "admin",
                        uid: "66fd56f6608685a1486b8b29",
                        sid: "23984y5v9b201875439v20185v39",
                        provider: "SessionProvider",
                    },
                ],
                "not-node:identity_root_should_have_primaryRole_root": [
                    {
                        root: true,
                        admin: false,
                        auth: true,
                        role: ["user"],
                        primaryRole: "user",
                        uid: "66fd56f6608685a1486b8b29",
                        sid: "23984y5v9b201875439v20185v39",
                        provider: "SessionProvider",
                    },
                    {
                        root: true,
                        admin: false,
                        auth: true,
                        role: ["admin"],
                        primaryRole: "admin",
                        uid: "66fd56f6608685a1486b8b29",
                        sid: "23984y5v9b201875439v20185v39",
                        provider: "SessionProvider",
                    },
                ],
                "not-node:identity_admin_should_have_primaryRole_admin": [
                    {
                        root: false,
                        admin: true,
                        auth: true,
                        role: ["user"],
                        primaryRole: "user",
                        uid: "66fd56f6608685a1486b8b29",
                        sid: "23984y5v9b201875439v20185v39",
                        provider: "SessionProvider",
                    },
                    {
                        root: false,
                        admin: true,
                        auth: true,
                        role: ["manager", "client"],
                        primaryRole: "client",
                        uid: "66fd56f6608685a1486b8b29",
                        sid: "23984y5v9b201875439v20185v39",
                        provider: "SessionProvider",
                    },
                ],
                "not-node:identity_guest_should_have_primaryRole_guest": [
                    {
                        root: false,
                        admin: false,
                        auth: false,
                        role: ["user"],
                        primaryRole: "user",
                        uid: "66fd56f6608685a1486b8b29",
                        sid: "23984y5v9b201875439v20185v39",
                        provider: "SessionProvider",
                    },
                    {
                        root: false,
                        admin: false,
                        auth: false,
                        role: ["manager"],
                        primaryRole: "admin",
                        uid: "66fd56f6608685a1486b8b29",
                        sid: "23984y5v9b201875439v20185v39",
                        provider: "SessionProvider",
                    },
                ],
            };

            Object.keys(listOfInvalidValues).forEach((error_message) => {
                listOfInvalidValues[error_message].forEach((val) => {
                    it(
                        "invalid: " + (val && val.toString && val.toString()) ||
                            typeof val,
                        () =>
                            expect(runner(validators, val)).to.throw(
                                error_message
                            )
                    );
                });
            });

            const listOfValidValues = [
                {
                    root: false,
                    admin: false,
                    auth: true,
                    role: ["user"],
                    primaryRole: "user",
                    uid: "66fd56f6608685a1486b8b29",
                    sid: "23984y5v9b201875439v20185v39",
                    provider: "SessionProvider",
                },
            ];
            listOfValidValues.forEach((val) => {
                it(
                    "valid: " + (val && val.toString && val.toString()) ||
                        typeof val,
                    () => expect(runner(validators, val)()).to.be.true
                );
            });
        });
    });

    describe("ObjectId", () => {
        describe("type", () => {
            const validators = require("../src/core/validators/objectId");
            const listOfInvalidValues = {
                "not-node:value_item_format_is_not_objectId": [
                    undefined,
                    true,
                    false,
                    1,
                    0,
                    -0,
                    "asdfsefsdf",
                    {},
                    new Date(),
                ],
            };

            Object.keys(listOfInvalidValues).forEach((error_message) => {
                listOfInvalidValues[error_message].forEach((val) => {
                    it(
                        "invalid: " + (val && val.toString && val.toString()) ||
                            typeof val,
                        () =>
                            expect(runner(validators, val)).to.throw(
                                error_message
                            )
                    );
                });
            });

            const listOfValidValues = [
                "66fd56f6608685a1486b8b29",
                "66fd56f6608685a1486b8b29",
            ];
            listOfValidValues.forEach((val) => {
                it(
                    "valid: " + (val && val.toString && val.toString()) ||
                        typeof val,
                    () => expect(runner(validators, val)()).to.be.true
                );
            });
        });

        describe("list", () => {
            const validators = require("../src/core/validators/objectId.list");
            const listOfInvalidValues = {
                "not-node:value_is_not_array": [
                    undefined,
                    true,
                    false,
                    1,
                    0,
                    -0,
                    "asdfsefsdf",
                    {},
                    new Date(),
                ],
                "not-node:value_items_are_not_all_objectId": [
                    ["undeaedaed"],
                    [123123],
                    ["12312"],
                    [new Date()],
                    [null],
                    [undefined],
                ],
            };

            Object.keys(listOfInvalidValues).forEach((error_message) => {
                listOfInvalidValues[error_message].forEach((val) => {
                    it(
                        "invalid: " + (val && val.toString && val.toString()) ||
                            typeof val,
                        () =>
                            expect(runner(validators, val)).to.throw(
                                error_message
                            )
                    );
                });
            });

            const listOfValidValues = [
                ["66fd56f6608685a1486b8b29", "66fd56f6608685a1486b8b29"],
                [],
            ];
            listOfValidValues.forEach((val) => {
                it(
                    "valid: " + (val && val.toString && val.toString()) ||
                        typeof val,
                    () => expect(runner(validators, val)()).to.be.true
                );
            });
        });
    });

    describe("String", () => {
        describe("type", () => {
            const validators = require("../src/core/validators/string");
            const listOfInvalidValues = {
                "not-node:value_type_is_not_string": [
                    undefined,
                    true,
                    false,
                    {},
                    new Date(),
                    1,
                    0,
                    -0,
                    [],
                ],
            };

            Object.keys(listOfInvalidValues).forEach((error_message) => {
                listOfInvalidValues[error_message].forEach((val) => {
                    it(
                        "invalid: " + (val && val.toString && val.toString()) ||
                            typeof val,
                        () =>
                            expect(runner(validators, val)).to.throw(
                                error_message
                            )
                    );
                });
            });

            const listOfValidValues = ["", "asdfq2843rv20198435y01843"];
            listOfValidValues.forEach((val) => {
                it(
                    "valid: " + (val && val.toString && val.toString()) ||
                        typeof val,
                    () => expect(runner(validators, val)()).to.be.true
                );
            });
        });

        describe("from10to10000", () => {
            const validators = require("../src/core/validators/string.10-10000");
            const listOfInvalidValues = {
                "not-node:value_is_too_short_10": ["", "1", "123456789"],
                "not-node:value_is_too_long_10000": [
                    "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",
                ],
            };

            Object.keys(listOfInvalidValues).forEach((error_message) => {
                listOfInvalidValues[error_message].forEach((val) => {
                    it("invalid: length of string " + val.length, () =>
                        expect(runner(validators, val)).to.throw(error_message)
                    );
                });
            });

            const listOfValidValues = [
                "1234567890",
                "asdfq2843rv20198435y01843",
            ];
            listOfValidValues.forEach((val) => {
                it(
                    "valid: length of string " + val.length,
                    () => expect(runner(validators, val)()).to.be.true
                );
            });
        });

        describe("email", () => {
            const validators = require("../src/core/validators/string.email");
            const listOfInvalidValues = {
                "not-node:email_is_not_valid": [
                    "",
                    "1",
                    "123,456789",
                    "asdfljiasdlkjfn.com",
                    "asda,sd@local",
                ],
            };

            Object.keys(listOfInvalidValues).forEach((error_message) => {
                listOfInvalidValues[error_message].forEach((val) => {
                    it("invalid: " + val, () =>
                        expect(runner(validators, val)).to.throw(error_message)
                    );
                });
            });

            const listOfValidValues = ["test@mail.host", "mail@compuserv.com"];
            listOfValidValues.forEach((val) => {
                it(
                    "valid: " + val,
                    () => expect(runner(validators, val)()).to.be.true
                );
            });
        });

        describe("ip", () => {
            const validators = require("../src/core/validators/string.ip");
            const listOfInvalidValues = {
                "not-node:value_is_not_ip_address": [
                    "",
                    "1",
                    "123,456789",
                    "asdfljiasdlkjfn.com",
                    "asda,sd@local",
                    "900.-1.7.101",
                    "0.1.7.257",
                    "1.0.257",
                ],
            };

            Object.keys(listOfInvalidValues).forEach((error_message) => {
                listOfInvalidValues[error_message].forEach((val) => {
                    it("invalid: " + val, () =>
                        expect(runner(validators, val)).to.throw(error_message)
                    );
                });
            });

            const listOfValidValues = ["127.0.1.1", "10.8.1.10", "0.0.0.0"];
            listOfValidValues.forEach((val) => {
                it(
                    "valid: " + val,
                    () => expect(runner(validators, val)()).to.be.true
                );
            });
        });

        describe("notEmpty", () => {
            const validators = require("../src/core/validators/string.not.empty");

            const listOfInvalidValues = {
                "not-node:value_is_empty": [""],
            };

            Object.keys(listOfInvalidValues).forEach((error_message) => {
                listOfInvalidValues[error_message].forEach((val) => {
                    it(
                        "invalid: " + (val && val.toString && val.toString()) ||
                            typeof val,
                        () =>
                            expect(runner(validators, val)).to.throw(
                                error_message
                            )
                    );
                });
            });

            it("valid: 'true'", () =>
                expect(runner(validators, "true")()).to.be.true);
            it("valid: 'f'", () =>
                expect(runner(validators, "f")()).to.be.true);
        });

        describe("telephone", () => {
            const validators = require("../src/core/validators/string.telephone");
            const listOfInvalidValues = {
                "not-node:value_is_not_telephone": [
                    "",
                    "1",
                    "14589",
                    "asdfljiasdlkjfn.com",
                    "asda,sd@local",
                    ".-1.7.101",
                    ".1.7.257",
                    "1.0.257",
                    "12345",
                    "+91239991234567",
                ],
            };

            Object.keys(listOfInvalidValues).forEach((error_message) => {
                listOfInvalidValues[error_message].forEach((val) => {
                    it("invalid: " + val, () =>
                        expect(runner(validators, val)).to.throw(error_message)
                    );
                });
            });

            const listOfValidValues = [
                "117123456789",
                "+7 (123) 123-12-12",
                "+4 (321) 000 - 12 - 99",
            ];
            listOfValidValues.forEach((val) => {
                it(
                    "valid: " + val,
                    () => expect(runner(validators, val)()).to.be.true
                );
            });
        });

        describe("uuid", () => {
            const validators = require("../src/core/validators/string.uuid");
            const listOfInvalidValues = {
                "not-node:value_is_not_uuid": [
                    "",
                    "1",
                    "14589",
                    "asdfljiasdlkjfn.com",
                    "asda,sd@local",
                    ".-1.7.101",
                    ".1.7.257",
                    "1.0.257",
                    "12345",
                    "+91239991234567",
                ],
            };

            Object.keys(listOfInvalidValues).forEach((error_message) => {
                listOfInvalidValues[error_message].forEach((val) => {
                    it("invalid: " + val, () =>
                        expect(runner(validators, val)).to.throw(error_message)
                    );
                });
            });

            const listOfValidValues = [
                "dfba64ce-80c5-11ef-b864-0242ac120002", //v1
                "85f030bd-80a3-45b1-aaab-577437954966", //v4
                "01924d83-408c-73fe-89cc-bed77e27b1c5", //v7
                "00000000-0000-0000-0000-000000000000", //empty
            ];
            listOfValidValues.forEach((val) => {
                it(
                    "valid: " + val,
                    () => expect(runner(validators, val)()).to.be.true
                );
            });
        });
    });
});
