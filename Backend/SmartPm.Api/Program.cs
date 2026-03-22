using SmartPm.Api.Data;
using SmartPm.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1. إضافة خدمة الـ CORS (هاد التعديل اللي بيسمح ليمامة بالربط)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()   // بيسمح لأي رابط (مثل بورت يمامة 3000)
              .AllowAnyMethod()   // بيسمح بكل العمليات (GET, POST, etc)
              .AllowAnyHeader();  // بيسمح بكل الرؤوس (Headers)
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHttpClient<AiService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

var app = builder.Build();

// 2. تفعيل  (Swagger)  الربط
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// 3. تفعيل  الـ CORS (مهم جداً ترتيبها يكون قبل Authorization)
app.UseCors("AllowAll"); 

app.UseAuthorization();
app.MapControllers();

app.Run();