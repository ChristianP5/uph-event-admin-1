const exceljs = require('exceljs');

const exportFormResponse = async (form, responses, department) => {
    const formName = form.name;
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet(`${formName} Responses`);

    const data = [];

    responses.forEach(response => {
        const item = {
            formId: form._id,
            department: department.name,
            departmentId: department._id,
            responseId: response._id,
            createdAt: response.createdAt,
        }

        for(let i = 0; i<form.questions.length; i+=1){
            item[`question${i+1}`] = form.questions[i];
            item[`rating${i+1}`] = response.ratings[i];
        }

        data.push(item);

    });

    const columns = [
        { header: 'Form ID', key: 'formId', width: 15 },
        { header: 'Department', key: 'department', width: 15 },
        { header: 'Department ID', key: 'departmentId', width: 15 },
        { header: 'Response ID', key: 'responseId', width: 20 },
        { header: 'Time', key: 'createdAt', width: 15 },
    ];

    for(let i = 0; i<form.questions.length; i+=1){
        const questionColumnItem = { header: `Question ${i+1}`, key: `question${i+1}`, width: 50 };
        const ratingColumnItem = { header: `Rating ${i+1}`, key: `rating${i+1}`, width: 10 };
        columns.push(questionColumnItem, ratingColumnItem);
    };

    worksheet.columns = columns;

    data.forEach( row => {
        worksheet.addRow(row);
    } );

    const buffer = await workbook.xlsx.writeBuffer();

    return buffer;
    
}

module.exports = exportFormResponse;