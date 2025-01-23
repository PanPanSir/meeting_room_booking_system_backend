## 为什么获取EntityManager实例需要手动inject，而获取configService就不需要呢

1. ConfigService 为什么不需要手动 @Inject() 注解：
ConfigService 是由 @nestjs/config 模块提供的，且它是通过 ConfigModule.forRoot() 在模块初始化时**全局注册的**。它自动作为全局提供者（global provider）进行注入，并且 NestJS 内部处理了它的生命周期和注入过程。

全局模块的注入机制：

ConfigModule 使用**isGlobal: true** 配置标记了该模块为全局模块。
一旦配置为全局模块，NestJS 会自动将其提供的服务（如 ConfigService）注入到任何需要它的地方，而不需要手动添加 @Inject() 注解。
这使得你在其他服务中使用 ConfigService 时，不需要显式地使用 @Inject() 注解来注入它，NestJS 会自动提供。

2. EntityManager 为什么需要手动 @Inject() 注解：
EntityManager 是 TypeORM 提供的，它并**不是一个全局**服务，且它的实例在每个请求上下文中动态创建。在 NestJS 中，EntityManager 是通过 TypeORM 模块注入的，它并不像 ConfigService 一样是全局模块的一部分。

EntityManager 的工作方式：

EntityManager 是与数据库操作相关的对象，它通常在特定的上下文中被实例化，比如在事务管理中或者在数据库操作时动态生成。
NestJS 没有自动将 EntityManager 作为全局提供者提供，因此需要手动注入。