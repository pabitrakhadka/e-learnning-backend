import Joi from "joi";


// First Name Validation Schema
const FirstNameValidate = () =>
    Joi.string()
        .min(3)
        .max(20)
        .regex(/^[A-Za-z\s]+$/)
        .messages({
            "string.min": "Name is too short (minimum 3 characters)",
            "string.max": "Name is too long (maximum 20 characters)",
            "string.pattern.base": "Name must contain only alphabetic characters and spaces",
            "any.required": "Name is required",
        })
        .required()

// Email Validation Schema
const EmailValidate = () =>
    Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            "string.email": "Invalid email",
            "any.required": "Required"
        });

const passwordValidate = () => {
    return Joi.string().min(4).max(50).messages({
        "string.min": "Too Short!",
        "string.max": "Too Long!",
        "any.required": "Required"
    })
}

    ;


// Registration Schema
const registerSchema = Joi.object({
    name: FirstNameValidate(),
    email: EmailValidate(),
    address: Joi.string()
        .min(3)
        .max(50)
        .required()
        .messages({
            "string.min": "Too Short!",
            "string.max": "Too Long!",
            "any.required": "Required"
        }),
    password: Joi.string().min(4).max(50).messages({
        "string.min": "Too Short!",
        "string.max": "Too Long!",
        "any.required": "Required"
    }),
    confirm_password: Joi.string().min(4).max(50).messages({
        "string.min": "Too Short!",
        "string.max": "Too Long!",
        "any.required": "Required"
    })
});

// Login Schema
const loginSchema = Joi.object({
    email: EmailValidate(),
    password: passwordValidate()
});

const idValidate = () => Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
        'number.base': '"NumberField" should be a number.',
        'number.positive': '"NumberField" must be a positive number.',
        'number.integer': '"NumberField" must be an integer.',
        'any.required': '"NumberField" is required.',
    });

const newsSchema = Joi.object({
    image: Joi.alternatives()
        .try(Joi.string(), Joi.allow(null)) // Accept a string (filename) or null
        .optional()
        .messages({
            "alternatives.types": "Image must be a valid string or null.",
        }),
    title: Joi.string()
        .required()
        .messages({
            "any.required": "Title is required.",
        }),
    description: Joi.string()
        .required().max(10000)
        .messages({
            "any.required": "Description is required.",
        }),
    category_id: Joi.number()
        .optional()
        .messages({
            "number.base": "Category ID must be a number.",
        }),
    created_by: Joi.number()
        .required()
        .messages({
            "any.required": "Created by is required.",
        }),
    update_by: Joi.number()
        .optional()
        .messages({
            "number.base": "Updated by must be a number.",
        }),
});



// Validate pdf files
const pdfFileSchema = Joi.object({
    file: Joi.object({
        originalname: Joi.string().required().regex(/\.pdf$/i).messages({
            "string.pattern.base": "File must be a PDF.",
        }),
        mimetype: Joi.string()
            .valid("application/pdf")
            .required()
            .messages({ "any.only": "File must be a valid PDF format." }),
        size: Joi.number()
            .max(5 * 1024 * 1024) // 5 MB limit
            .required()
            .messages({
                "number.max": "File size must be less than or equal to 5 MB.",
            }),
    }).required().messages({
        "object.base": "File data is required.",
    }),
    category: Joi.string()
        .required()
        .messages({
            'string.base': '"Category" should be a string',
            'string.empty': '"Category" is required'
        }),
});

const stringValidate = () => {
    return Joi.string().min(5).required().messages({
        'string.base': '"Message" should be a string',
        'string.empty': '"Message" is required'
    });
};
//Contact Data Schema
const contactSchema = Joi.object({
    name: FirstNameValidate(),
    email: EmailValidate(),
    subject: stringValidate(),
    message: stringValidate(),
})


//Slug validate
const slugSchema = Joi.object({
    title: stringValidate(),
    description: stringValidate()
});



// const adminSchema = Joi.object({
//     firstName: FirstNameValidate(),
//     lastName: LastNameValidate(),
//     email: EmailValidate(),
//     password: passwordValidate(),
//     address: stringValidate(),

// });

// const loginAdmin = Joi.object({
//     email: EmailValidate(),
//     password: passwordValidate()
// });

const system_SettingSchema = Joi.object({
    key: stringValidate(),
    value: stringValidate(),
    description: stringValidate(),
});
const categorySchema = Joi.object({
    description: Joi.string()
        .pattern(/^[a-zA-Z\u0900-\u097F\s.,]*$/) // Allowing punctuation like '.' and ','.
        .optional()
        .messages({
            "string.pattern.base": "Description must contain only English or Nepali characters.",
        }), name: Joi.string()
            .pattern(/^[a-zA-Z\u0900-\u097F\s]+$/)
            .required()
            .messages({
                "string.pattern.base": "Name must contain only English or Nepali characters.",
                "string.empty": "Name is required."
            }),
    description: Joi.string()
        .pattern(/^[a-zA-Z\u0900-\u097F\s.,]*$/) // Allowing punctuation like '.' and ','.
        .optional()
        .messages({
            "string.pattern.base": "Description must contain only English or Nepali characters.",
        }),
});

const ebookSchema = Joi.object({
    title: Joi.string()
        .min(3)
        .max(255)
        .required()
        .messages({
            'string.base': 'Title must be a string.',
            'string.empty': 'Title cannot be empty.',
            'string.min': 'Title should be at least 3 characters long.',
            'string.max': 'Title should be less than 255 characters long.',
            'any.required': 'Title is required.',
        }),
    author: Joi.string()
        .min(3)
        .max(255)
        .required()
        .messages({
            'string.base': 'Author must be a string.',
            'string.empty': 'Author cannot be empty.',
            'string.min': 'Author name should be at least 3 characters long.',
            'string.max': 'Author name should be less than 255 characters long.',
            'any.required': 'Author is required.',
        }),
    description: Joi.string()
        .min(10)
        .max(1000)
        .required()
        .messages({
            'string.base': 'Description must be a string.',
            'string.empty': 'Description cannot be empty.',
            'string.min': 'Description should be at least 10 characters long.',
            'string.max': 'Description should be less than 1000 characters long.',
            'any.required': 'Description is required.',
        }),

});
const noticeSchema = Joi.object({
    title: Joi.string()
        .min(3)
        .max(255)
        .required()
        .messages({
            'string.base': 'Title must be a string.',
            'string.empty': 'Title cannot be empty.',
            'string.min': 'Title should be at least 3 characters long.',
            'string.max': 'Title should be less than 255 characters long.',
            'any.required': 'Title is required.',
        }),
    content: Joi.string()
        .min(10)
        .max(1000)
        .required()
        .messages({
            'string.base': 'Content must be a string.',
            'string.empty': 'Content cannot be empty.',
            'string.min': 'Content should be at least 10 characters long.',
            'string.max': 'Content should be less than 1000 characters long.',
            'any.required': 'Content is required.',
        }),

});

const systemSettingSchemaJoi = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'ID must be a number',
            'number.integer': 'ID must be an integer',
            'number.positive': 'ID must be a positive number',
            'any.required': 'ID is required',
        }),
    key: Joi.string()
        .min(1)
        .required()
        .messages({
            'string.base': 'Key must be a string',
            'string.min': 'Key must not be empty',
            'any.required': 'Key is required',
        }),
    value: Joi.string()
        .min(1)
        .required()
        .messages({
            'string.base': 'Value must be a string',
            'string.min': 'Value must not be empty',
            'any.required': 'Value is required',
        }),
    description: Joi.string().optional(),
});

//Export Schemas
export { contactSchema, registerSchema, loginSchema, categorySchema, newsSchema, ebookSchema, noticeSchema };
