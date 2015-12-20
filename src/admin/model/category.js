'use strict';
/**
 * model
 */
export default class extends think.model.base {

    async info(id){
        //获取分类信息
        console.log(id);
        let map = {};
        if(think.isNumber(id)){
            map.id = id;
        }else{
            map.name = id;
        }
        return await this.where(map).find();
    }
    /**
     * 获取分类树，指定分类则返回指定分类及其子分类，不指定则返回所有分类树
     *
     */
     async gettree(id = 0 , field = true){
         /*获取当前分类信息*/

        //if(id){
        //    console.log(id);
        //    let ids = id;
        //    let info = await this.info(ids);
        //    console.log(info);
        //    let id   = info.id;
        //}

        //获取所有分类

        let map = {"status":{">":-1}}
        let list = await this.field(field).where(map).order('sort').select();
        //console.log(list);
        list = get_children(list,id);
        let info = list;

        return info;
     }
    /**
     * 获取分类信息并缓存分类
     * @param  integer id    分类ID
     * @param  string  field 要获取的字段名
     * @return string         分类信息
     */
    async get_category(id, field = null){

        /* 非法分类ID */
        if(think.isEmpty(id) || !think.isNumberString(id)){
            return '';
        }
            let list = await think.cache("sys_category_list", () => {
              return this.getallcate();
            }, {timeout: 365 * 24 * 3600});
        if(think.isEmpty(list) || 1 != list[id].status){//不存在分类，或分类被禁用
            return '';
        }
        return think.isNumber(field) ? list[id] : list[id][field];
    }

    async getallcate(){
        let lists = {}
        let cate=  await this.select()
        for(let v of cate){
            lists[v.id] = v
        }
        return lists;
    }
    /**
     * 获取参数的所有父级分类
     * @param int id 分类id
     * @return array 参数分类和父类的信息集合
     * @author
     */
    async get_parent_category(id){
        let breadcrumb = []
        while (id!=0)
        {
            let nav = await this.where({'id':id,'status':1}).field("id,title,pid").find();
            breadcrumb.push(nav);
            id = nav.pid;

        }
       return breadcrumb.reverse()
    }
}